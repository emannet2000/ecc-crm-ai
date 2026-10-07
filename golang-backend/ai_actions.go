package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"sort"
	"strings"
	"time"
)

type aiAction struct {
	ID        string         `json:"id"`
	Kind      string         `json:"kind"`
	Entity    string         `json:"entity"`
	RecordID  string         `json:"recordId"`
	Label     string         `json:"label"`
	Fields    map[string]any `json:"fields"`
	Before    map[string]any `json:"before,omitempty"`
	Revision  string         `json:"revision,omitempty"`
	Status    string         `json:"status"`
	ExpiresAt string         `json:"expiresAt"`
	Result    any            `json:"result,omitempty"`
}
type aiUpdateSpec struct {
	Request any
	Handler http.HandlerFunc
}

func aiUpdate(entity string) (aiUpdateSpec, bool) {
	specs := map[string]aiUpdateSpec{"contacts": {contactRequest{}, updateContact}, "deals": {dealRequest{}, updateDeal}, "tasks": {taskRequest{}, updateTask}, "schools": {schoolRequest{}, updateSchoolHandler}, "students": {studentRequest{}, updateStudentHandler}, "agents": {agentRequest{}, updateAgentHandler}, "leads": {leadRequest{}, updateLeadHandler}, "cases": {caseRequest{}, updateCaseHandler}, "documents": {documentRequest{}, updateDocumentHandler}, "invoices": {invoiceRequest{}, updateInvoiceHandler}, "partners": {partnerRequest{}, updatePartnerHandler}}
	spec, ok := specs[entity]
	return spec, ok
}
func aiEditableFields(entity string) []string {
	spec, ok := aiUpdate(entity)
	if !ok {
		return []string{}
	}
	fields := []string{}
	kind := reflect.TypeOf(spec.Request)
	for i := 0; i < kind.NumField(); i++ {
		name := strings.Split(kind.Field(i).Tag.Get("json"), ",")[0]
		if name != "" && name != "-" && name != "filePath" {
			fields = append(fields, name)
		}
	}
	sort.Strings(fields)
	return fields
}
func validAIDate(value any) bool {
	text, ok := value.(string)
	if !ok {
		return false
	}
	if text == "" {
		return true
	}
	_, err := time.Parse("2006-01-02", text)
	return err == nil
}
func prepareAIAction(r *http.Request, threadID, kind, entity, id string, fields map[string]any) (aiAction, error) {
	a := aiAction{ID: newID("aiaction"), Kind: kind, Entity: entity, RecordID: id, Fields: fields, Status: "pending", ExpiresAt: time.Now().Add(24 * time.Hour).UTC().Format(time.RFC3339), Before: map[string]any{}}
	settings := loadAISettings(r)
	user := currentUser(r)
	if !settings.Enabled || !settings.Actions || !settings.RecordContext || user.Role == "viewer" {
		return a, fmt.Errorf("AI actions are disabled or your account is read only")
	}
	if len(fields) == 0 || len(mustJSON(fields)) > 12000 {
		return a, fmt.Errorf("Supply a bounded set of proposed fields")
	}
	var record map[string]any
	if id != "" {
		var err error
		record, err = sqlRecord(r, entity, id)
		if err != nil {
			return a, fmt.Errorf("Record is not accessible")
		}
		var scope RecordScope
		json.Unmarshal([]byte(mustJSON(record)), &scope)
		if !canWrite(scope, user) {
			return a, fmt.Errorf("You cannot change this record")
		}
		a.Label = recordLabel(mustJSON(record))
		a.Revision = versionOf(record)
	}
	allowed := []string{}
	switch kind {
	case "create_task":
		allowed = []string{"title", "description", "status", "dueDate", "contactId", "owner"}
		if entity != "" && entity != "contacts" {
			return a, fmt.Errorf("Link a new task to a contact, or leave entity/id empty")
		}
		if entity == "contacts" {
			a.Fields["contactId"] = id
		}
		if strings.TrimSpace(fmtString(fields["title"])) == "" {
			return a, fmt.Errorf("A task title is required")
		}
		if _, ok := fields["status"]; !ok {
			fields["status"] = "todo"
		}
		if _, ok := fields["owner"]; !ok {
			fields["owner"] = user.Name
		}
		if a.Label == "" {
			a.Label = fmtString(fields["title"])
		}
		if contactID := fmtString(fields["contactId"]); contactID != "" {
			contact, err := sqlRecord(r, "contacts", contactID)
			if err != nil {
				return a, fmt.Errorf("Contact is not accessible")
			}
			var scope RecordScope
			json.Unmarshal([]byte(mustJSON(contact)), &scope)
			if !canWrite(scope, user) {
				return a, fmt.Errorf("You cannot create a follow-up for this contact")
			}
			if id == "" {
				a.Entity = "contacts"
				a.RecordID = contactID
				a.Revision = versionOf(contact)
				a.Label = recordLabel(mustJSON(contact))
			}
		}
	case "update_record":
		if record == nil {
			return a, fmt.Errorf("Read the target record before proposing an update")
		}
		allowed = aiEditableFields(entity)
		if len(allowed) == 0 {
			return a, fmt.Errorf("This module has no editable record form")
		}
	case "schedule_followup":
		if record == nil {
			return a, fmt.Errorf("Choose a lead, case, task or contact")
		}
		allowed = []string{"followUpDate", "message"}
		if fmtString(fields["followUpDate"]) == "" || !validAIDate(fields["followUpDate"]) {
			return a, fmt.Errorf("An explicit YYYY-MM-DD follow-up date is required")
		}
		if entity != "leads" && entity != "cases" && entity != "tasks" && entity != "contacts" {
			return a, fmt.Errorf("Follow-ups support leads, cases, tasks and contacts")
		}
	case "send_email":
		if entity != "contacts" || record == nil {
			return a, fmt.Errorf("Read and select the recipient contact first")
		}
		allowed = []string{"recipient", "subject", "body", "contactId"}
		fields["contactId"] = id
		if !validEmail(fmtString(fields["recipient"])) || strings.TrimSpace(fmtString(fields["subject"])) == "" || strings.ContainsAny(fmtString(fields["subject"]), "\r\n") || strings.TrimSpace(fmtString(fields["body"])) == "" {
			return a, fmt.Errorf("Review an explicit recipient, subject and message")
		}
	case "schedule_meeting":
		if entity != "contacts" || record == nil {
			return a, fmt.Errorf("Select an accessible contact for the meeting")
		}
		allowed = []string{"title", "occurredAt", "body"}
		if strings.TrimSpace(fmtString(fields["title"])) == "" {
			return a, fmt.Errorf("A meeting title is required")
		}
		if _, err := time.Parse(time.RFC3339, fmtString(fields["occurredAt"])); err != nil {
			return a, fmt.Errorf("Specify the meeting date and time with a timezone, for example 2026-10-08T09:00:00+08:00")
		}
	default:
		return a, fmt.Errorf("Unsupported action")
	}
	for key, value := range fields {
		permitted := false
		for _, name := range allowed {
			if name == key {
				permitted = true
			}
		}
		if !permitted {
			return a, fmt.Errorf("Field %s is not editable for this action", key)
		}
		if strings.HasSuffix(key, "Date") || key == "dueDate" || key == "nextDeadline" {
			if !validAIDate(value) {
				return a, fmt.Errorf("Field %s requires a YYYY-MM-DD date", key)
			}
		}
		if record != nil {
			a.Before[key] = record[key]
		}
	}
	if _, err := database.Exec(`INSERT INTO ai_actions(id,org_id,user_id,thread_id,kind,entity,record_id,payload,revision,status,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,'pending',?,?)`, a.ID, user.OrgID, user.ID, threadID, kind, a.Entity, a.RecordID, mustJSON(a), a.Revision, utcNow(), a.ExpiresAt); err != nil {
		return a, err
	}
	return a, nil
}
func loadAIAction(r *http.Request, id string) (aiAction, error) {
	var a aiAction
	var payload, status, result string
	err := storeDB(r).QueryRow(`SELECT payload,status,result FROM ai_actions WHERE id=? AND org_id=? AND user_id=?`, id, currentUser(r).OrgID, currentUser(r).ID).Scan(&payload, &status, &result)
	if err != nil {
		return a, err
	}
	if err = json.Unmarshal([]byte(payload), &a); err != nil {
		return a, err
	}
	a.Status = status
	if result != "" {
		json.Unmarshal([]byte(result), &a.Result)
	}
	return a, nil
}
func handleAIConfirm(w http.ResponseWriter, r *http.Request) {
	a, err := loadAIAction(r, r.PathValue("action"))
	if err != nil {
		writeError(w, 404, "Action not found")
		return
	}
	if a.Status == "confirmed" {
		writeJSON(w, 200, a)
		return
	}
	if a.Status != "pending" || a.ExpiresAt < utcNow() {
		writeError(w, 409, "This action expired or was cancelled. Request a new proposal")
		return
	}
	settings := loadAISettings(r)
	if !settings.Enabled || !settings.Actions || !settings.RecordContext || currentUser(r).Role == "viewer" {
		writeError(w, 403, "AI actions are disabled or your account cannot edit records")
		return
	}
	var record map[string]any
	if a.RecordID != "" {
		record, err = sqlRecord(r, a.Entity, a.RecordID)
		if err != nil {
			writeError(w, 404, "Record no longer accessible")
			return
		}
		var scope RecordScope
		json.Unmarshal([]byte(mustJSON(record)), &scope)
		if !canWrite(scope, currentUser(r)) {
			writeError(w, 403, "Your permission to change this record was removed")
			return
		}
		if versionOf(record) != a.Revision {
			writeError(w, 409, "The record changed after this proposal. Ask the assistant for a fresh proposal")
			return
		}
	}
	inner := r.Clone(r.Context())
	inner.Header = r.Header.Clone()
	inner.Header.Set("Content-Type", "application/json")
	inner.Header.Del("If-Match")
	fields := map[string]any{}
	for key, value := range a.Fields {
		fields[key] = value
	}
	handler := http.HandlerFunc(nil)
	switch a.Kind {
	case "create_task":
		inner.Method = "POST"
		inner.URL.Path = "/api/tasks"
		handler = createTask
	case "update_record":
		spec, ok := aiUpdate(a.Entity)
		if !ok {
			writeError(w, 400, "Unsupported update")
			return
		}
		body := map[string]any{}
		for _, key := range aiEditableFields(a.Entity) {
			if value, exists := record[key]; exists {
				body[key] = value
			}
		}
		for key, value := range fields {
			body[key] = value
		}
		fields = body
		inner.Method = "PUT"
		inner.URL.Path = "/api/" + a.Entity + "/" + a.RecordID
		inner.SetPathValue("id", a.RecordID)
		inner.Header.Set("If-Match", a.Revision)
		handler = spec.Handler
	case "schedule_followup":
		switch a.Entity {
		case "leads":
			fields = map[string]any{"id": a.RecordID, "followUpDate": a.Fields["followUpDate"], "message": a.Fields["message"], "score": record["score"], "sourceCost": record["sourceCost"]}
			inner.URL.Path = "/api/workflows/lead"
			inner.SetPathValue("action", "lead")
			handler = handleWorkflow
		case "contacts":
			fields = map[string]any{"title": "Follow up: " + a.Label, "description": a.Fields["message"], "contactId": a.RecordID, "dueDate": a.Fields["followUpDate"], "owner": currentUser(r).Name, "status": "todo"}
			inner.URL.Path = "/api/tasks"
			handler = createTask
		case "tasks", "cases":
			fields = map[string]any{}
			for _, key := range aiEditableFields(a.Entity) {
				if v, ok := record[key]; ok {
					fields[key] = v
				}
			}
			if a.Entity == "tasks" {
				fields["dueDate"] = a.Fields["followUpDate"]
				if message := fmtString(a.Fields["message"]); message != "" {
					fields["description"] = message
				}
				handler = updateTask
			} else {
				fields["nextDeadline"] = a.Fields["followUpDate"]
				if message := fmtString(a.Fields["message"]); message != "" {
					fields["nextAction"] = message
				}
				handler = updateCaseHandler
			}
			inner.URL.Path = "/api/" + a.Entity + "/" + a.RecordID
			inner.SetPathValue("id", a.RecordID)
			inner.Method = "PUT"
		}
		if inner.Method != "PUT" {
			inner.Method = "POST"
		}
		inner.Header.Set("If-Match", a.Revision)
	case "send_email":
		inner.Method = "POST"
		inner.URL.Path = "/api/mail"
		handler = handleComposeMail
	case "schedule_meeting":
		inner.Method = "POST"
		inner.URL.Path = "/api/calendar/events"
		inner.SetPathValue("id", a.RecordID)
		fields["contactId"] = a.RecordID
		handler = handleAIMeeting
	default:
		writeError(w, 400, "Unsupported action")
		return
	}
	if handler == nil {
		writeError(w, 400, "Unsupported action")
		return
	}
	inner.Body = io.NopCloser(strings.NewReader(mustJSON(fields)))
	inner.ContentLength = int64(len(mustJSON(fields)))
	response := &bufferedResponse{header: make(http.Header)}
	// Reuse the normal normalization, ownership and related-record validation.
	scopedHandler(handler, response, inner, currentUser(r))
	if response.status < 200 || response.status >= 300 {
		for key, values := range response.header {
			w.Header()[key] = values
		}
		w.WriteHeader(response.status)
		w.Write(response.body.Bytes())
		return
	}
	var result any
	json.Unmarshal(response.body.Bytes(), &result)
	if _, err = storeDB(r).Exec("UPDATE ai_actions SET status='confirmed',result=? WHERE id=? AND status='pending'", mustJSON(result), a.ID); err != nil {
		writeError(w, 500, "Could not save action confirmation")
		return
	}
	a.Status = "confirmed"
	a.Result = result
	writeJSON(w, 200, a)
}
func handleAIReject(w http.ResponseWriter, r *http.Request) {
	result, err := storeDB(r).Exec("UPDATE ai_actions SET status='cancelled' WHERE id=? AND org_id=? AND user_id=? AND status='pending'", r.PathValue("action"), currentUser(r).OrgID, currentUser(r).ID)
	if err != nil {
		writeError(w, 500, "Could not cancel proposal")
		return
	}
	count, _ := result.RowsAffected()
	if count == 0 {
		writeError(w, 404, "Pending proposal not found")
		return
	}
	writeJSON(w, 200, statusResponse{"ok"})
}
func handleAIMeeting(w http.ResponseWriter, r *http.Request) {
	var fields map[string]any
	if !decodeRequest(w, r, &fields) {
		return
	}
	contact, err := sqlRecord(r, "contacts", fmtString(fields["contactId"]))
	if err != nil {
		writeError(w, 404, "Contact not accessible")
		return
	}
	var scope RecordScope
	json.Unmarshal([]byte(mustJSON(contact)), &scope)
	if !canWrite(scope, currentUser(r)) {
		writeError(w, 403, "You cannot schedule a meeting for this contact")
		return
	}
	fields["scope"] = scope
	fields["createdBy"] = currentUser(r).Name
	id, err := entry(r, "calendar_event", fmtString(fields["contactId"]), fields, false)
	if err != nil {
		writeError(w, 500, "Could not schedule meeting")
		return
	}
	writeJSON(w, 201, map[string]any{"id": id, "event": fields, "message": "Meeting added to the workspace calendar. No invitation email was sent."})
}
func handleAICalendar(w http.ResponseWriter, r *http.Request) {
	rows, err := queryObjects(r, "SELECT id,data FROM workspace_entries WHERE org_id=? AND category='calendar_event' ORDER BY created_at DESC LIMIT 200", currentUser(r).OrgID)
	if err != nil {
		writeError(w, 500, "Could not load meetings")
		return
	}
	events := []map[string]any{}
	for _, row := range rows {
		var data map[string]any
		json.Unmarshal([]byte(fmtString(row["data"])), &data)
		if _, err := sqlRecord(r, "contacts", fmtString(data["contactId"])); err == nil {
			data["id"] = row["id"]
			events = append(events, data)
		}
	}
	writeJSON(w, 200, map[string]any{"events": events})
}
