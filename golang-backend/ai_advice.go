package main

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

func handleAIAdvice(w http.ResponseWriter, r *http.Request) {
	settings := loadAISettings(r)
	if !assistantEnabled(r) || !settings.Proactive || !settings.RecordContext {
		writeJSON(w, 200, map[string]any{"status": "disabled", "message": "An administrator can enable proactive AI advice in AI settings."})
		return
	}
	var day, status, reply, sourceData, dependencies, updated, errorText string
	err := database.QueryRow("SELECT day,status,reply,sources,dependencies,updated_at,error FROM ai_advice WHERE org_id=? AND user_id=?", currentUser(r).OrgID, currentUser(r).ID).Scan(&day, &status, &reply, &sourceData, &dependencies, &updated, &errorText)
	refs := []aiReference{}
	json.Unmarshal([]byte(dependencies), &refs)
	currentDay := organizationToday(r)
	if err != nil || day != currentDay || (status == "ready" && !aiReferencesAllowed(r, refs, settings)) {
		if _, err := database.Exec(`INSERT INTO ai_advice(org_id,user_id,day,status,updated_at) VALUES(?,?,?,'queued',?) ON CONFLICT(org_id,user_id) DO UPDATE SET day=excluded.day,status='queued',reply='',sources='[]',dependencies='[]',updated_at=excluded.updated_at,error='' WHERE ai_advice.status<>'processing' OR ai_advice.updated_at<?`, currentUser(r).OrgID, currentUser(r).ID, currentDay, utcNow(), time.Now().Add(-3*time.Minute).UTC().Format(time.RFC3339)); err != nil {
			writeError(w, 500, "Could not queue advice")
			return
		}
		writeJSON(w, 200, map[string]any{"status": "queued", "message": "Your daily adviser is preparing recommendations."})
		return
	}
	if status == "ready" {
		sources := []aiReference{}
		json.Unmarshal([]byte(sourceData), &sources)
		writeJSON(w, 200, map[string]any{"status": status, "reply": reply, "sources": sources, "updatedAt": updated})
		return
	}
	writeJSON(w, 200, map[string]any{"status": status, "message": errorText})
}
func processAIAdvice(ctx context.Context) {
	// Schedule opted-in workspaces for recently active users; viewing the advice
	// panel also queues a user even when they authenticate with bearer tokens.
	rows, err := queryObjects(aiUserRequest(ctx, User{}), `SELECT u.id FROM users u JOIN workspace_entries e ON e.id='ai_'||u.org_id WHERE u.disabled=0 AND json_extract(e.data,'$.enabled')=1 AND json_extract(e.data,'$.proactive')=1 AND EXISTS(SELECT 1 FROM sessions s WHERE s.user_id=u.id AND s.last_seen>? AND s.revoked_at IS NULL) LIMIT 500`, time.Now().Add(-24*time.Hour).UTC().Format(time.RFC3339))
	if err == nil {
		for _, row := range rows {
			user, ok := committedUser(aiUserRequest(ctx, User{}), "id", fmtString(row["id"]))
			if !ok || user.Disabled {
				continue
			}
			r := aiUserRequest(ctx, user)
			settings := loadAISettings(r)
			if !settings.RecordContext {
				continue
			}
			day := organizationToday(r)
			database.Exec(`INSERT INTO ai_advice(org_id,user_id,day,status,updated_at) VALUES(?,?,?,'queued',?) ON CONFLICT(org_id,user_id) DO UPDATE SET day=excluded.day,status='queued',reply='',sources='[]',dependencies='[]',updated_at=excluded.updated_at,error='' WHERE ai_advice.day<>excluded.day AND ai_advice.status<>'processing'`, user.OrgID, user.ID, day, utcNow())
		}
	}
	database.Exec("UPDATE ai_advice SET status='queued' WHERE status='processing' AND updated_at<?", time.Now().Add(-3*time.Minute).UTC().Format(time.RFC3339))
	var org, userID string
	if database.QueryRow("SELECT org_id,user_id FROM ai_advice WHERE status='queued' ORDER BY updated_at LIMIT 1").Scan(&org, &userID) != nil {
		return
	}
	user, ok := committedUser(aiUserRequest(ctx, User{}), "id", userID)
	if !ok || user.Disabled || user.OrgID != org {
		database.Exec("DELETE FROM ai_advice WHERE org_id=? AND user_id=?", org, userID)
		return
	}
	r := aiUserRequest(ctx, user)
	settings := loadAISettings(r)
	if !settings.Enabled || !settings.Proactive || !settings.RecordContext {
		database.Exec("UPDATE ai_advice SET status='disabled',updated_at=? WHERE org_id=? AND user_id=?", utcNow(), org, userID)
		return
	}
	claim, err := database.Exec("UPDATE ai_advice SET status='processing',updated_at=? WHERE org_id=? AND user_id=? AND status='queued'", utcNow(), org, userID)
	if err != nil {
		return
	}
	count, _ := claim.RowsAffected()
	if count == 0 {
		return
	}
	s, err := sqlWorkspace(r)
	if err != nil {
		database.Exec("UPDATE ai_advice SET status='failed',error='Could not load work',updated_at=? WHERE org_id=? AND user_id=?", utcNow(), org, userID)
		return
	}
	items := aiAttention(s, user, organizationToday(r))
	agent := &aiAgent{R: r, Settings: settings, ReadOnly: true, Sources: aiAttentionReferences(s, items), Actions: []aiAction{}}
	reply := "No overdue work, missing next actions, required-document gaps or overdue deal close dates were found in your priority worklist."
	if len(items) > 0 {
		reply, err = agent.run([]any{map[string]any{"role": "user", "content": "Prepare concise proactive advice from this authorized worklist. Name the top three priorities, explain the factual trigger, and suggest the next action. Link each recommendation to source IDs. Do not propose mutations or contact anyone. Worklist: " + mustJSON(items)}})
	}
	if err == nil {
		err = aiStillAuthorized(r, settings)
	}
	if err == nil && !aiReferencesAllowed(r, agent.Sources, settings) {
		database.Exec("UPDATE ai_advice SET status='queued',updated_at=? WHERE org_id=? AND user_id=?", utcNow(), org, userID)
		return
	}
	if err != nil {
		database.Exec("UPDATE ai_advice SET status='failed',error=?,updated_at=? WHERE org_id=? AND user_id=?", err.Error(), utcNow(), org, userID)
		return
	}
	if _, err = database.Exec("UPDATE ai_advice SET status='ready',reply=?,sources=?,dependencies=?,updated_at=? WHERE org_id=? AND user_id=?", reply, mustJSON(agent.Sources), mustJSON(agent.Sources), utcNow(), org, userID); err != nil {
		return
	}
	database.Exec("INSERT OR IGNORE INTO notifications VALUES(?,?,?,?,?,?,?,?,?,NULL)", newID("notice"), org, userID, "ai", "Your AI advice is ready", "Open Ask ECC AI to review your daily recommendations.", "/", "ai-advice:"+organizationToday(r)+":"+userID, utcNow())
}
func aiAttentionReferences(s diskStore, items []productivityItem) []aiReference {
	refs := []aiReference{}
	records := recordsOf(s)
	caseIDs := map[string]bool{}
	for _, item := range items {
		entity := aiPlural(item.Entity)
		var record map[string]any
		json.Unmarshal([]byte(records[entity][item.ID]), &record)
		refs = append(refs, recordReference(entity, item.ID, record))
		if entity == "cases" {
			caseIDs[item.ID] = true
		}
	}
	for _, doc := range s.Documents {
		if caseIDs[doc.CaseID] && doc.Required && doc.Status != "Verified" {
			var record map[string]any
			json.Unmarshal([]byte(mustJSON(doc)), &record)
			refs = append(refs, recordReference("documents", doc.ID, record))
		}
	}
	return refs
}
