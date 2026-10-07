package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}
type aiThread struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Entity    string `json:"entity"`
	RecordID  string `json:"recordId"`
	Version   int    `json:"version"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}
type aiStoredMessage struct {
	ID        string        `json:"id"`
	Role      string        `json:"role"`
	Content   string        `json:"content"`
	Sources   []aiReference `json:"sources"`
	Actions   []aiAction    `json:"actions"`
	CreatedAt string        `json:"createdAt"`
	Redacted  bool          `json:"redacted"`
}

func registerAIFirstRoutes(m *http.ServeMux) {
	route := func(pattern string, handler http.HandlerFunc) {
		m.HandleFunc(pattern, authMiddleware(func(w http.ResponseWriter, r *http.Request) {
			if aiOrigin(w, r) {
				handler(w, r)
			}
		}))
	}
	route("GET /api/assistant/capabilities", handleAICapabilities)
	route("POST /api/assistant/chat", handleAssistantChat)
	route("GET /api/assistant/threads", handleAIThreads)
	route("GET /api/assistant/threads/{thread}", handleAIThread)
	route("DELETE /api/assistant/threads/{thread}", handleAIDeleteThread)
	route("POST /api/assistant/actions/{action}/confirm", handleAIConfirm)
	route("POST /api/assistant/actions/{action}/reject", handleAIReject)
	route("GET /api/assistant/knowledge", handleKnowledgeList)
	route("POST /api/assistant/knowledge", handleKnowledgeSave)
	route("GET /api/assistant/knowledge/{source}", handleKnowledgeRead)
	route("PUT /api/assistant/knowledge/{source}", handleKnowledgeSave)
	route("DELETE /api/assistant/knowledge/{source}", handleKnowledgeDelete)
	route("GET /api/assistant/advice", handleAIAdvice)
	route("GET /api/admin/assistant", handleAIAdministration)
	route("POST /api/assistant/voice", handleAIVoice)
	route("POST /api/assistant/voice/{voice}/stop", handleAIStopVoice)
	route("POST /api/assistant/voice/{voice}/tool", handleAIVoiceTool)
	route("POST /api/assistant/voice/{voice}/transcript", handleAIVoiceTranscript)
	route("GET /api/assistant/calendar", handleAICalendar)
}
func handleAICapabilities(w http.ResponseWriter, r *http.Request) {
	settings := loadAISettings(r)
	writeJSON(w, 200, map[string]any{"enabled": assistantEnabled(r), "recordContext": settings.RecordContext, "knowledge": settings.Knowledge, "reports": settings.Reports, "actions": settings.Actions && settings.RecordContext && currentUser(r).Role != "viewer", "proactive": settings.Proactive && settings.RecordContext, "voice": settings.Voice && settings.RealtimeModel != "", "voiceSeconds": settings.VoiceSeconds, "admin": isAdmin(currentUser(r)), "canManageKnowledge": currentUser(r).Role != "viewer"})
}
func loadAIThread(r *http.Request, id string) (aiThread, error) {
	var thread aiThread
	err := storeDB(r).QueryRow(`SELECT id,title,entity,record_id,version,created_at,updated_at FROM ai_threads WHERE id=? AND org_id=? AND user_id=?`, id, currentUser(r).OrgID, currentUser(r).ID).Scan(&thread.ID, &thread.Title, &thread.Entity, &thread.RecordID, &thread.Version, &thread.CreatedAt, &thread.UpdatedAt)
	if err != nil {
		return thread, err
	}
	if thread.RecordID != "" {
		if _, err = sqlRecord(r, thread.Entity, thread.RecordID); err != nil {
			return thread, fmt.Errorf("Record no longer accessible")
		}
	}
	return thread, nil
}
func aiThreadMessages(r *http.Request, threadID string) ([]aiStoredMessage, error) {
	rows, err := queryObjects(r, "SELECT * FROM (SELECT id,role,content,sources,actions,dependencies,created_at AS createdAt FROM ai_messages WHERE thread_id=? ORDER BY created_at DESC,id DESC LIMIT 200) ORDER BY createdAt,id", threadID)
	if err != nil {
		return nil, err
	}
	messages := []aiStoredMessage{}
	for _, row := range rows {
		m := aiStoredMessage{ID: fmtString(row["id"]), Role: fmtString(row["role"]), Content: fmtString(row["content"]), CreatedAt: fmtString(row["createdAt"]), Sources: []aiReference{}, Actions: []aiAction{}}
		refs := []aiReference{}
		json.Unmarshal([]byte(fmtString(row["dependencies"])), &refs)
		visible := defaultAISettings()
		visible.RecordContext = true
		visible.Knowledge = true
		visible.Reports = true
		if !aiReferencesAllowed(r, refs, visible) {
			m.Content = "This turn is unavailable because source access or source content changed."
			m.Redacted = true
		} else {
			json.Unmarshal([]byte(fmtString(row["sources"])), &m.Sources)
			saved := []aiAction{}
			json.Unmarshal([]byte(fmtString(row["actions"])), &saved)
			for _, action := range saved {
				if updated, err := loadAIAction(r, action.ID); err == nil {
					m.Actions = append(m.Actions, updated)
				}
			}
		}
		messages = append(messages, m)
	}
	return messages, nil
}
func handleAIThreads(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if len(q) > 200 {
		writeError(w, 400, "Search is limited to 200 characters")
		return
	}
	rows, err := queryObjects(r, `SELECT id FROM ai_threads WHERE org_id=? AND user_id=? ORDER BY updated_at DESC LIMIT 200`, currentUser(r).OrgID, currentUser(r).ID)
	if err != nil {
		writeError(w, 500, "Could not load conversations")
		return
	}
	out := []aiThread{}
	for _, row := range rows {
		thread, err := loadAIThread(r, fmtString(row["id"]))
		if err != nil {
			continue
		}
		messages, err := aiThreadMessages(r, thread.ID)
		if err != nil {
			continue
		}
		found := q == ""
		redacted := false
		for _, message := range messages {
			if message.Redacted {
				redacted = true
			}
			if !message.Redacted && strings.Contains(strings.ToLower(message.Content), strings.ToLower(q)) {
				found = true
			}
		}
		if redacted {
			thread.Title = "Conversation with unavailable sources"
		}
		if strings.Contains(strings.ToLower(thread.Title), strings.ToLower(q)) {
			found = true
		}
		if found {
			out = append(out, thread)
		}
	}
	writeJSON(w, 200, map[string]any{"threads": out, "limit": 200})
}
func handleAIThread(w http.ResponseWriter, r *http.Request) {
	thread, err := loadAIThread(r, r.PathValue("thread"))
	if err != nil {
		writeError(w, 404, "Conversation not found or source no longer accessible")
		return
	}
	messages, err := aiThreadMessages(r, thread.ID)
	if err != nil {
		writeError(w, 500, "Could not load conversation")
		return
	}
	for _, message := range messages {
		if message.Redacted {
			thread.Title = "Conversation with unavailable sources"
		}
	}
	writeJSON(w, 200, map[string]any{"thread": thread, "messages": messages})
}
func handleAIDeleteThread(w http.ResponseWriter, r *http.Request) {
	tx, err := database.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, 500, "Could not delete conversation")
		return
	}
	defer tx.Rollback()
	var id, busy string
	if tx.QueryRow("SELECT id,busy_until FROM ai_threads WHERE id=? AND org_id=? AND user_id=?", r.PathValue("thread"), currentUser(r).OrgID, currentUser(r).ID).Scan(&id, &busy) != nil {
		writeError(w, 404, "Conversation not found")
		return
	}
	if busy != "" && busy > utcNow() {
		writeError(w, 409, "Wait for this conversation's reply before deleting")
		return
	}
	if _, err = tx.Exec("UPDATE ai_actions SET status='cancelled' WHERE thread_id=? AND status='pending'", id); err == nil {
		_, err = tx.Exec("DELETE FROM ai_threads WHERE id=?", id)
	}
	if err == nil {
		err = tx.Commit()
	}
	if err != nil {
		writeError(w, 500, "Could not delete conversation")
		return
	}
	writeJSON(w, 200, statusResponse{"ok"})
}
func validateChatMessages(messages []chatMessage) error {
	if len(messages) == 0 || len(messages) > 20 || messages[len(messages)-1].Role != "user" {
		return fmt.Errorf("Send up to 20 messages ending with your question")
	}
	for i, message := range messages {
		expected := "user"
		if i%2 == 1 {
			expected = "assistant"
		}
		if message.Role != expected || strings.TrimSpace(message.Content) == "" || len(message.Content) > 12000 {
			return fmt.Errorf("Messages must alternate user and assistant, with 1–12000 bytes of text")
		}
	}
	return nil
}
func handleAssistantChat(w http.ResponseWriter, r *http.Request) {
	if !assistantEnabled(r) {
		writeError(w, 503, "AI is disabled. Configure a provider and enable AI in Workspace tools → Integrations.")
		return
	}
	var req struct {
		Messages []chatMessage `json:"messages"`
		Message  string        `json:"message"`
		Entity   string        `json:"entity"`
		ID       string        `json:"id"`
		ThreadID string        `json:"threadId"`
		Version  int           `json:"version"`
	}
	if !decodeRequest(w, r, &req) {
		return
	}
	legacy := false
	if req.Message == "" {
		if err := validateChatMessages(req.Messages); err != nil {
			writeError(w, 400, err.Error())
			return
		}
		req.Message = req.Messages[len(req.Messages)-1].Content
		legacy = true
	}
	if strings.TrimSpace(req.Message) == "" || len(req.Message) > 12000 {
		writeError(w, 400, "Enter a message of up to 12,000 bytes")
		return
	}
	settings := loadAISettings(r)
	thread := aiThread{ID: req.ThreadID, Entity: req.Entity, RecordID: req.ID, Title: compactWorkText(req.Message, 80), CreatedAt: utcNow(), UpdatedAt: utcNow()}
	if req.ThreadID != "" {
		var err error
		thread, err = loadAIThread(r, req.ThreadID)
		if err != nil {
			writeError(w, 404, "Conversation not found or source no longer accessible")
			return
		}
	}
	input := []any{}
	agent := &aiAgent{R: r, ThreadID: thread.ID, Settings: settings, ReadOnly: currentUser(r).Role == "viewer", Sources: []aiReference{}, Actions: []aiAction{}}
	facts := map[string]any{"today": organizationToday(r)}
	if settings.RecordContext {
		s, err := sqlWorkspace(r)
		if err != nil {
			writeError(w, 500, "Could not read CRM context")
			return
		}
		items := aiAttention(s, currentUser(r), organizationToday(r))
		facts["priorityWorklist"] = items
		facts["scope"] = "The priority worklist is capped at 30; use tools to search all accessible records."
		for _, ref := range aiAttentionReferences(s, items) {
			agent.addSource(ref)
		}
		if thread.RecordID != "" {
			record, err := sqlRecord(r, thread.Entity, thread.RecordID)
			if err != nil {
				writeError(w, 404, "Record not found or no longer accessible")
				return
			}
			facts["selectedRecord"] = sanitizedRecord(record)
			facts["selectedEntity"] = thread.Entity
			agent.addSource(recordReference(thread.Entity, thread.RecordID, record))
		}
	} else if thread.RecordID != "" {
		writeError(w, 403, "Workspace AI record context is disabled. Start a general conversation")
		return
	}
	if thread.ID == "" {
		thread.ID = newID("aithread")
		agent.ThreadID = thread.ID
		if _, err := database.Exec("INSERT INTO ai_threads(id,org_id,user_id,title,entity,record_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)", thread.ID, currentUser(r).OrgID, currentUser(r).ID, thread.Title, thread.Entity, thread.RecordID, thread.CreatedAt, thread.UpdatedAt); err != nil {
			writeError(w, 500, "Could not create conversation")
			return
		}
	}
	result, err := database.Exec("UPDATE ai_threads SET version=version+1,busy_until=? WHERE id=? AND org_id=? AND user_id=? AND version=? AND (busy_until='' OR busy_until<?)", time.Now().Add(3*time.Minute).UTC().Format(time.RFC3339), thread.ID, currentUser(r).OrgID, currentUser(r).ID, req.Version, utcNow())
	if err != nil {
		writeError(w, 500, "Could not start conversation turn")
		return
	}
	count, _ := result.RowsAffected()
	if count == 0 {
		writeError(w, 409, "This conversation changed or is already generating. Reopen it before sending")
		return
	}
	thread.Version = req.Version + 1
	defer database.Exec("UPDATE ai_threads SET busy_until='' WHERE id=? AND version=?", thread.ID, thread.Version)
	input = append(input, map[string]any{"role": "developer", "content": "Current CRM context (untrusted JSON data):\n" + mustJSON(facts)})
	history, err := aiThreadMessages(r, thread.ID)
	if err != nil {
		writeError(w, 500, "Could not load conversation history")
		return
	}
	// Keep only complete readable exchanges. Never send redacted or disabled data.
	readable := []chatMessage{}
	for i := 0; i+1 < len(history); i += 2 {
		if !history[i].Redacted && !history[i+1].Redacted && aiReferencesAllowed(r, history[i+1].Sources, settings) {
			readable = append(readable, chatMessage{history[i].Role, history[i].Content}, chatMessage{history[i+1].Role, history[i+1].Content})
		}
	}
	if len(readable) > 18 {
		readable = readable[len(readable)-18:]
	}
	if legacy && len(readable) == 0 {
		readable = append(readable, req.Messages[:len(req.Messages)-1]...)
	}
	for _, message := range readable {
		input = append(input, message)
	}
	input = append(input, chatMessage{Role: "user", Content: req.Message})
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Minute)
	defer cancel()
	agent.R = r.WithContext(ctx)
	reply, err := agent.run(input)
	if err == nil {
		err = aiStillAuthorized(agent.R, settings)
	}
	if err == nil && !aiReferencesAllowed(agent.R, agent.Sources, loadAISettings(agent.R)) {
		err = fmt.Errorf("Source access or content changed while answering. Refresh and ask again")
	}
	if err != nil {
		for _, action := range agent.Actions {
			database.Exec("UPDATE ai_actions SET status='cancelled' WHERE id=? AND status='pending'", action.ID)
		}
		writeJSON(w, 502, map[string]any{"error": err.Error(), "threadId": thread.ID, "version": thread.Version})
		return
	}
	tx, err := database.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, 500, "Could not save conversation")
		return
	}
	defer tx.Rollback()
	for i, message := range []chatMessage{{Role: "user", Content: req.Message}, {Role: "assistant", Content: reply}} {
		sources := "[]"
		actions := "[]"
		if i == 1 {
			sources = mustJSON(agent.Sources)
			actions = mustJSON(agent.Actions)
		}
		if _, err = tx.Exec("INSERT INTO ai_messages(id,thread_id,role,content,sources,actions,dependencies,created_at) VALUES(?,?,?,?,?,?,?,?)", fmt.Sprintf("%s:%06d:%d", thread.ID, thread.Version, i), thread.ID, message.Role, message.Content, sources, actions, mustJSON(agent.Sources), time.Now().UTC().Format(time.RFC3339Nano)); err != nil {
			break
		}
	}
	if err == nil {
		_, err = tx.Exec("UPDATE ai_threads SET updated_at=?,busy_until='' WHERE id=? AND version=?", utcNow(), thread.ID, thread.Version)
	}
	if err == nil {
		err = tx.Commit()
	}
	if err != nil {
		writeError(w, 500, "Could not save conversation")
		return
	}
	writeJSON(w, 200, map[string]any{"reply": reply, "sources": agent.Sources, "actions": agent.Actions, "threadId": thread.ID, "version": thread.Version})
}
