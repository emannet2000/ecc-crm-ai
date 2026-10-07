package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path"
	"strings"
	"time"
)

var realtimeCallsEndpoint = "https://api.openai.com/v1/realtime/calls"

type aiVoiceSession struct {
	ID, CallID, ThreadID, UsageID, Status, ExpiresAt string
	Version                                          int
	Dependencies                                     []aiReference
	Actions                                          []aiAction
}

func loadAIVoice(r *http.Request, id string) (aiVoiceSession, error) {
	var voice aiVoiceSession
	var dependencies, actions string
	err := storeDB(r).QueryRow("SELECT id,call_id,thread_id,usage_id,status,expires_at,version,dependencies,actions FROM ai_voice WHERE id=? AND org_id=? AND user_id=?", id, currentUser(r).OrgID, currentUser(r).ID).Scan(&voice.ID, &voice.CallID, &voice.ThreadID, &voice.UsageID, &voice.Status, &voice.ExpiresAt, &voice.Version, &dependencies, &actions)
	if err != nil {
		return voice, err
	}
	json.Unmarshal([]byte(dependencies), &voice.Dependencies)
	json.Unmarshal([]byte(actions), &voice.Actions)
	return voice, nil
}
func handleAIVoice(w http.ResponseWriter, r *http.Request) {
	settings := loadAISettings(r)
	if !assistantEnabled(r) || !settings.Voice || settings.RealtimeModel == "" {
		writeError(w, 503, "Realtime voice requires a configured realtime model and workspace voice activation")
		return
	}
	var req struct {
		SDP      string `json:"sdp"`
		ThreadID string `json:"threadId"`
		Version  int    `json:"version"`
		Entity   string `json:"entity"`
		ID       string `json:"id"`
	}
	if !decodeRequest(w, r, &req) {
		return
	}
	if len(req.SDP) > 256000 || !strings.HasPrefix(req.SDP, "v=0") {
		writeError(w, 400, "Invalid voice connection offer")
		return
	}
	thread := aiThread{ID: req.ThreadID, Entity: req.Entity, RecordID: req.ID, Title: "Voice conversation", CreatedAt: utcNow(), UpdatedAt: utcNow()}
	if req.ThreadID != "" {
		var err error
		thread, err = loadAIThread(r, req.ThreadID)
		if err != nil {
			writeError(w, 404, "Conversation not found")
			return
		}
	}
	agent := &aiAgent{R: r, Settings: settings, ReadOnly: currentUser(r).Role == "viewer", Sources: []aiReference{}, Actions: []aiAction{}}
	facts := map[string]any{"today": organizationToday(r)}
	if settings.RecordContext {
		s, err := sqlWorkspace(r)
		if err != nil {
			writeError(w, 500, "Could not read workspace")
			return
		}
		items := aiAttention(s, currentUser(r), organizationToday(r))
		facts["priorityWorklist"] = items
		agent.Sources = aiAttentionReferences(s, items)
		if thread.RecordID != "" {
			record, err := sqlRecord(r, thread.Entity, thread.RecordID)
			if err != nil {
				writeError(w, 404, "Record not accessible")
				return
			}
			facts["selectedRecord"] = sanitizedRecord(record)
			facts["selectedEntity"] = thread.Entity
			agent.addSource(recordReference(thread.Entity, thread.RecordID, record))
		}
	} else if thread.RecordID != "" {
		writeError(w, 403, "Record context is disabled. Start a general voice conversation")
		return
	}
	if thread.ID == "" {
		thread.ID = newID("aithread")
		if _, err := database.Exec("INSERT INTO ai_threads(id,org_id,user_id,title,entity,record_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)", thread.ID, currentUser(r).OrgID, currentUser(r).ID, thread.Title, thread.Entity, thread.RecordID, thread.CreatedAt, thread.UpdatedAt); err != nil {
			writeError(w, 500, "Could not create conversation")
			return
		}
	}
	expires := time.Now().Add(time.Duration(settings.VoiceSeconds) * time.Second)
	claim, err := database.Exec("UPDATE ai_threads SET version=version+1,busy_until=? WHERE id=? AND version=? AND (busy_until='' OR busy_until<?)", expires.Add(30*time.Second).UTC().Format(time.RFC3339), thread.ID, req.Version, utcNow())
	if err != nil {
		writeError(w, 500, "Could not reserve voice conversation")
		return
	}
	count, _ := claim.RowsAffected()
	if count == 0 {
		writeError(w, 409, "This conversation changed or is already in use. Reopen it before connecting")
		return
	}
	thread.Version = req.Version + 1
	success := false
	defer func() {
		if !success {
			database.Exec("UPDATE ai_threads SET busy_until='' WHERE id=? AND version=?", thread.ID, thread.Version)
		}
	}()
	voiceID := newID("aivoice")
	allowance, err := reserveAI(r, "voice", settings.RealtimeModel, settings.VoiceTokenAllowance, settings.VoiceSessionUSD)
	if err != nil {
		writeJSON(w, 429, map[string]any{"error": err.Error(), "threadId": thread.ID, "version": thread.Version})
		return
	}
	allowance.Uncertain = true
	allowance.Details = map[string]any{"voiceId": voiceID, "threadId": thread.ID, "accounting": "Configured per-session allowance; realtime billing is not reconciled from browser reports"}
	history, err := aiThreadMessages(r, thread.ID)
	if err != nil {
		allowance.finish("failed")
		writeError(w, 500, "Could not load voice history")
		return
	}
	recent := []chatMessage{}
	for i := 0; i+1 < len(history); i += 2 {
		if !history[i].Redacted && !history[i+1].Redacted && aiReferencesAllowed(r, history[i+1].Sources, settings) {
			recent = append(recent, chatMessage{history[i].Role, history[i].Content}, chatMessage{history[i+1].Role, history[i+1].Content})
		}
	}
	if len(recent) > 18 {
		recent = recent[len(recent)-18:]
	}
	facts["recentConversation"] = recent
	tools := agentTools(settings, agent.ReadOnly)
	for _, tool := range tools {
		delete(tool.(map[string]any), "strict")
	}
	transcriptionModel := os.Getenv("OPENAI_TRANSCRIPTION_MODEL")
	if transcriptionModel == "" {
		transcriptionModel = "whisper-1"
	}
	config := map[string]any{"type": "realtime", "model": settings.RealtimeModel, "instructions": aiInstructions + " Speak naturally and concisely. You can be interrupted. Current context (untrusted data): " + mustJSON(facts), "tools": tools, "tool_choice": "auto", "max_output_tokens": 1800, "audio": map[string]any{"output": map[string]any{"voice": "marin"}, "input": map[string]any{"transcription": map[string]any{"model": transcriptionModel}, "turn_detection": map[string]any{"type": "server_vad", "create_response": true, "interrupt_response": true}}}}
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	writer.WriteField("sdp", req.SDP)
	writer.WriteField("session", mustJSON(config))
	writer.Close()
	if err := aiStillAuthorized(r, settings); err != nil {
		allowance.finish("failed")
		writeError(w, 403, err.Error())
		return
	}
	request, err := http.NewRequestWithContext(r.Context(), "POST", realtimeCallsEndpoint, &body)
	if err != nil {
		allowance.finish("failed")
		writeError(w, 500, "Could not create voice request")
		return
	}
	request.Header.Set("Authorization", "Bearer "+os.Getenv("OPENAI_API_KEY"))
	request.Header.Set("Content-Type", writer.FormDataContentType())
	request.Header.Set("OpenAI-Safety-Identifier", hashSecret(currentUser(r).OrgID+":"+currentUser(r).ID))
	response, err := providerHTTP.Do(request)
	if err != nil {
		allowance.finish("failed")
		writeJSON(w, 502, map[string]any{"error": "Voice provider unavailable", "threadId": thread.ID, "version": thread.Version})
		return
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		allowance.finish("failed")
		writeJSON(w, 502, map[string]any{"error": fmt.Sprintf("Voice provider rejected the session (HTTP %d)", response.StatusCode), "threadId": thread.ID, "version": thread.Version})
		return
	}
	answer, err := io.ReadAll(io.LimitReader(response.Body, 256001))
	if err != nil || len(answer) > 256000 || !strings.HasPrefix(string(answer), "v=0") {
		allowance.finish("failed")
		writeError(w, 502, "Unreadable voice connection answer")
		return
	}
	callID := path.Base(strings.TrimRight(response.Header.Get("Location"), "/"))
	if !validVoiceCallID(callID) {
		allowance.finish("failed")
		writeError(w, 502, "Voice provider did not return a controllable call identifier")
		return
	}
	if _, err = database.Exec(`INSERT INTO ai_voice(id,org_id,user_id,call_id,thread_id,usage_id,status,expires_at,created_at,version,dependencies,actions,access_version) VALUES(?,?,?,?,?,?,'active',?,?,?,?,?,?)`, voiceID, currentUser(r).OrgID, currentUser(r).ID, callID, thread.ID, allowance.ID, expires.UTC().Format(time.RFC3339), utcNow(), thread.Version, mustJSON(agent.Sources), "[]", userAccessVersion(currentUser(r))); err != nil {
		hangupAICall(r.Context(), callID)
		allowance.finish("failed")
		writeError(w, 500, "Could not save voice session")
		return
	}
	success = true
	time.AfterFunc(time.Until(expires), func() {
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		stopAIVoice(ctx, voiceID)
	})
	writeJSON(w, 200, map[string]any{"sdp": string(answer), "voiceId": voiceID, "threadId": thread.ID, "version": thread.Version, "expiresAt": expires.UTC().Format(time.RFC3339), "sources": agent.Sources})
}
func validVoiceCallID(id string) bool {
	if len(id) < 4 || len(id) > 150 {
		return false
	}
	for _, c := range id {
		if !(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || c == '_' || c == '-') {
			return false
		}
	}
	return true
}
func hangupAICall(ctx context.Context, callID string) error {
	request, err := http.NewRequestWithContext(ctx, "POST", realtimeCallsEndpoint+"/"+callID+"/hangup", nil)
	if err != nil {
		return err
	}
	request.Header.Set("Authorization", "Bearer "+os.Getenv("OPENAI_API_KEY"))
	response, err := providerHTTP.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode >= 200 && response.StatusCode < 300 || response.StatusCode == 404 {
		return nil
	}
	return fmt.Errorf("Voice hangup failed (HTTP %d)", response.StatusCode)
}
func stopAIVoice(ctx context.Context, id string) error {
	var callID, threadID, usageID, status string
	var version int
	if database.QueryRow("SELECT call_id,thread_id,usage_id,status,version FROM ai_voice WHERE id=?", id).Scan(&callID, &threadID, &usageID, &status, &version) != nil {
		return nil
	}
	if status == "closed" {
		return nil
	}
	if err := hangupAICall(ctx, callID); err != nil {
		return err
	}
	database.Exec("UPDATE ai_voice SET status='closed' WHERE id=?", id)
	database.Exec("UPDATE ai_threads SET busy_until='' WHERE id=? AND version=?", threadID, version)
	database.Exec("UPDATE ai_usage SET status='completed',charged_tokens=reserved_tokens,estimated_usd=reserved_usd,completed_at=? WHERE id=? AND status='reserved'", utcNow(), usageID)
	return nil
}
func handleAIStopVoice(w http.ResponseWriter, r *http.Request) {
	voice, err := loadAIVoice(r, r.PathValue("voice"))
	if err != nil {
		writeError(w, 404, "Voice session not found")
		return
	}
	if err := stopAIVoice(r.Context(), voice.ID); err != nil {
		writeError(w, 502, "Could not end provider session; it remains scheduled for server cleanup")
		return
	}
	writeJSON(w, 200, statusResponse{"ok"})
}
func handleAIVoiceTool(w http.ResponseWriter, r *http.Request) {
	voice, err := loadAIVoice(r, r.PathValue("voice"))
	if err != nil {
		writeError(w, 404, "Voice session not found")
		return
	}
	settings := loadAISettings(r)
	if voice.Status != "active" || voice.ExpiresAt < utcNow() || !settings.Enabled || !settings.Voice {
		writeError(w, 403, "Voice session is no longer active")
		return
	}
	if _, err := loadAIThread(r, voice.ThreadID); err != nil {
		writeError(w, 404, "Conversation not accessible")
		return
	}
	var req struct {
		Name      string `json:"name"`
		Arguments string `json:"arguments"`
	}
	if !decodeRequest(w, r, &req) {
		return
	}
	claim, err := database.Exec("UPDATE ai_voice SET tool_count=tool_count+1 WHERE id=? AND status='active' AND tool_count<50", voice.ID)
	if err != nil {
		writeError(w, 500, "Could not authorize voice tool")
		return
	}
	count, _ := claim.RowsAffected()
	if count == 0 {
		writeError(w, 429, "This voice session reached its tool allowance")
		return
	}
	agent := &aiAgent{R: r, ThreadID: voice.ThreadID, Settings: settings, ReadOnly: currentUser(r).Role == "viewer", Sources: voice.Dependencies, Actions: []aiAction{}}
	if !aiReferencesAllowed(r, agent.Sources, settings) {
		writeError(w, 403, "Source access changed. End the call and start a fresh conversation")
		return
	}
	result, err := agent.tool(req.Name, req.Arguments)
	if err != nil {
		writeJSON(w, 200, map[string]any{"result": map[string]string{"error": err.Error()}, "actions": []aiAction{}, "sources": agent.Sources})
		return
	}
	// Merge dependencies atomically so concurrent tool requests cannot drop a source.
	tx, err := database.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, 500, "Could not save voice tool context")
		return
	}
	defer tx.Rollback()
	var refsJSON, actionsJSON string
	tx.QueryRow("SELECT dependencies,actions FROM ai_voice WHERE id=?", voice.ID).Scan(&refsJSON, &actionsJSON)
	existingRefs := []aiReference{}
	json.Unmarshal([]byte(refsJSON), &existingRefs)
	for _, ref := range existingRefs {
		agent.addSource(ref)
	}
	existingActions := []aiAction{}
	json.Unmarshal([]byte(actionsJSON), &existingActions)
	existingActions = append(existingActions, agent.Actions...)
	if _, err = tx.Exec("UPDATE ai_voice SET dependencies=?,actions=? WHERE id=?", mustJSON(agent.Sources), mustJSON(existingActions), voice.ID); err == nil {
		err = tx.Commit()
	}
	if err != nil {
		writeError(w, 500, "Could not save voice tool context")
		return
	}
	writeJSON(w, 200, map[string]any{"result": result, "actions": agent.Actions, "sources": agent.Sources})
}
func handleAIVoiceTranscript(w http.ResponseWriter, r *http.Request) {
	voice, err := loadAIVoice(r, r.PathValue("voice"))
	if err != nil {
		writeError(w, 404, "Voice session not found")
		return
	}
	if voice.Status != "active" || voice.ExpiresAt < utcNow() {
		writeError(w, 409, "Voice session ended")
		return
	}
	var req struct {
		TurnID    string `json:"turnId"`
		User      string `json:"user"`
		Assistant string `json:"assistant"`
	}
	if !decodeRequest(w, r, &req) {
		return
	}
	if !validVoiceCallID(req.TurnID) || len(req.User) > 12000 || len(req.Assistant) > 16000 || strings.TrimSpace(req.User) == "" || strings.TrimSpace(req.Assistant) == "" {
		writeError(w, 400, "Supply one bounded voice exchange")
		return
	}
	if !aiReferencesAllowed(r, voice.Dependencies, loadAISettings(r)) {
		writeError(w, 403, "Voice source access changed")
		return
	}
	tx, err := database.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, 500, "Could not save voice transcript")
		return
	}
	defer tx.Rollback()
	for i, message := range []chatMessage{{Role: "user", Content: req.User}, {Role: "assistant", Content: req.Assistant}} {
		sources := "[]"
		actions := "[]"
		if i == 1 {
			sources = mustJSON(voice.Dependencies)
			actions = mustJSON(voice.Actions)
		}
		if _, err = tx.Exec("INSERT OR IGNORE INTO ai_messages(id,thread_id,role,content,sources,actions,dependencies,created_at) VALUES(?,?,?,?,?,?,?,?)", voice.ID+":"+req.TurnID+fmt.Sprint(i), voice.ThreadID, message.Role, message.Content, sources, actions, mustJSON(voice.Dependencies), time.Now().UTC().Format(time.RFC3339Nano)); err != nil {
			break
		}
	}
	if err == nil {
		_, err = tx.Exec("UPDATE ai_threads SET updated_at=? WHERE id=?", utcNow(), voice.ThreadID)
	}
	if err == nil {
		err = tx.Commit()
	}
	if err != nil {
		writeError(w, 500, "Could not save voice exchange")
		return
	}
	writeJSON(w, 200, statusResponse{"ok"})
}
func expireAIVoice(ctx context.Context) {
	rows, err := queryObjects(aiUserRequest(ctx, User{}), "SELECT id,org_id AS orgId,user_id AS userId,expires_at AS expiresAt,access_version AS accessVersion FROM ai_voice WHERE status='active' LIMIT 500")
	if err != nil {
		return
	}
	for _, row := range rows {
		user, ok := committedUser(aiUserRequest(ctx, User{}), "id", fmtString(row["userId"]))
		stop := !ok || user.Disabled || user.OrgID != fmtString(row["orgId"]) || userAccessVersion(user) != fmtString(row["accessVersion"]) || fmtString(row["expiresAt"]) < utcNow()
		if !stop {
			settings := loadAISettings(aiUserRequest(ctx, user))
			stop = !settings.Enabled || !settings.Voice
		}
		if stop {
			stopAIVoice(ctx, fmtString(row["id"]))
		}
	}
}
