package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

type Handlers struct {
	store    *Store
	sessions *SessionStore
}

type AuthedHandler func(w http.ResponseWriter, r *http.Request, u *User)

// ---------- helpers ----------

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func decodeBody(r *http.Request, v interface{}) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields() // tolerant? no, but useful signal; remove if you prefer
	return dec.Decode(v)
}

func idFromPath(r *http.Request) (int, bool) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return 0, false
	}
	return id, true
}

// ---------- auth middleware ----------

func (h *Handlers) Auth(next AuthedHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			writeErr(w, http.StatusUnauthorized, "missing bearer token")
			return
		}
		tok := strings.TrimPrefix(auth, "Bearer ")
		uid, ok := h.sessions.UserID(tok)
		if !ok {
			writeErr(w, http.StatusUnauthorized, "invalid token")
			return
		}
		u := h.store.userByID(uid)
		if u == nil {
			writeErr(w, http.StatusUnauthorized, "user not found")
			return
		}
		next(w, r, u)
	}
}

// ============================================================
// AUTH
// ============================================================

func (h *Handlers) Login(w http.ResponseWriter, r *http.Request) {
	var body LoginBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	u := h.store.userByEmail(body.Email)
	if u == nil || u.Password != body.Password {
		writeErr(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	tok := h.sessions.New(u.ID)
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"token": tok,
		"user":  u,
	})
}

func (h *Handlers) Me(w http.ResponseWriter, r *http.Request, u *User) {
	writeJSON(w, http.StatusOK, u)
}

func (h *Handlers) ChangePassword(w http.ResponseWriter, r *http.Request, u *User) {
	var body PasswordChangeBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	if u.Password != body.Current {
		writeErr(w, http.StatusBadRequest, "current password is incorrect")
		return
	}
	h.store.mu.Lock()
	u.Password = body.New
	h.store.mu.Unlock()
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ============================================================
// USERS
// ============================================================

func (h *Handlers) ListUsers(w http.ResponseWriter, r *http.Request, u *User) {
	h.store.mu.RLock()
	out := make([]User, 0, len(h.store.users))
	for _, x := range h.store.users {
		out = append(out, *x)
	}
	h.store.mu.RUnlock()
	writeJSON(w, http.StatusOK, out)
}

func (h *Handlers) CreateUser(w http.ResponseWriter, r *http.Request, actor *User) {
	if actor.Role != "admin" {
		writeErr(w, http.StatusForbidden, "admin only")
		return
	}
	var body NewUserBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	if h.store.userByEmail(body.Email) != nil {
		writeErr(w, http.StatusConflict, "email already in use")
		return
	}
	u := h.store.addUser(body.Email, body.Name, body.Role, body.Password)
	writeJSON(w, http.StatusOK, u)
}

func (h *Handlers) UpdateUser(w http.ResponseWriter, r *http.Request, actor *User) {
	if actor.Role != "admin" {
		writeErr(w, http.StatusForbidden, "admin only")
		return
	}
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	var body UpdateUserBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	h.store.mu.Lock()
	u, exists := h.store.users[id]
	if !exists {
		h.store.mu.Unlock()
		writeErr(w, http.StatusNotFound, "user not found")
		return
	}
	u.Name = body.Name
	u.Role = body.Role
	if body.Password != nil && *body.Password != "" {
		u.Password = *body.Password
	}
	h.store.mu.Unlock()
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handlers) DeleteUser(w http.ResponseWriter, r *http.Request, actor *User) {
	if actor.Role != "admin" {
		writeErr(w, http.StatusForbidden, "admin only")
		return
	}
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	h.store.mu.Lock()
	delete(h.store.users, id)
	for email, u := range h.store.usersByMail {
		if u.ID == id {
			delete(h.store.usersByMail, email)
		}
	}
	h.store.mu.Unlock()
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ============================================================
// LEADS
// ============================================================

func (h *Handlers) ListLeads(w http.ResponseWriter, r *http.Request, u *User) {
	writeJSON(w, http.StatusOK, h.store.listLeads())
}

func (h *Handlers) GetLeadDetail(w http.ResponseWriter, r *http.Request, u *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	det, ok := h.store.leadDetail(id)
	if !ok {
		writeErr(w, http.StatusNotFound, "lead not found")
		return
	}
	writeJSON(w, http.StatusOK, det)
}

func (h *Handlers) CreateLead(w http.ResponseWriter, r *http.Request, actor *User) {
	var body NewLeadBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	stage := "New Lead"
	if body.Stage != nil && *body.Stage != "" {
		stage = *body.Stage
	}
	lead := &Lead{
		FullName:     body.FullName,
		Email:        body.Email,
		Phone:        body.Phone,
		Source:       body.Source,
		Quality:      body.Quality,
		Stage:        stage,
		Destination:  body.Destination,
		Service:      body.Service,
		Notes:        body.Notes,
		NextFollowup: body.NextFollowup,
		ConsultantID: body.ConsultantID,
	}
	lead = h.store.addLead(lead)
	writeJSON(w, http.StatusOK, lead)
}

func (h *Handlers) UpdateLead(w http.ResponseWriter, r *http.Request, actor *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	var body UpdateLeadBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	h.store.mu.Lock()
	lead, exists := h.store.leads[id]
	if !exists {
		h.store.mu.Unlock()
		writeErr(w, http.StatusNotFound, "lead not found")
		return
	}
	if body.FullName != nil {
		lead.FullName = derefStr(body.FullName)
	}
	lead.Email = body.Email
	lead.Phone = body.Phone
	lead.Source = body.Source
	lead.Quality = body.Quality
	if body.Stage != nil && *body.Stage != "" {
		lead.Stage = *body.Stage
	}
	lead.Destination = body.Destination
	lead.Service = body.Service
	lead.Notes = body.Notes
	lead.LastContact = body.LastContact
	lead.NextFollowup = body.NextFollowup
	lead.ConsultantID = body.ConsultantID
	lead.ConsultantName = h.store.userName(body.ConsultantID)
	lead.UpdatedAt = nowISO()
	h.store.appendAudit(actor, "lead", lead.ID, &lead.FullName, "updated", nil)
	h.store.mu.Unlock()
	writeJSON(w, http.StatusOK, lead)
}

func (h *Handlers) DeleteLead(w http.ResponseWriter, r *http.Request, actor *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	h.store.mu.Lock()
	lead, exists := h.store.leads[id]
	if exists {
		delete(h.store.leads, id)
		h.store.appendAudit(actor, "lead", id, &lead.FullName, "deleted", nil)
		// cascade tasks & activities
		for tid, t := range h.store.tasks {
			if t.LeadID == id {
				delete(h.store.tasks, tid)
			}
		}
		for aid, a := range h.store.acts {
			if a.LeadID == id {
				delete(h.store.acts, aid)
			}
		}
	}
	h.store.mu.Unlock()
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

var leadStageOrder = []string{
	"New Lead", "Contacted", "Initial Assessment", "Qualified",
	"Consultation Booked", "Proposal Sent", "Converted", "Closed/Lost",
}

func nextStage(current string) string {
	for i, s := range leadStageOrder {
		if s == current && i+1 < len(leadStageOrder) {
			return leadStageOrder[i+1]
		}
	}
	return current
}

func (h *Handlers) AdvanceLead(w http.ResponseWriter, r *http.Request, actor *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	h.store.mu.Lock()
	lead, exists := h.store.leads[id]
	if !exists {
		h.store.mu.Unlock()
		writeErr(w, http.StatusNotFound, "lead not found")
		return
	}
	lead.Stage = nextStage(lead.Stage)
	lead.UpdatedAt = nowISO()
	h.store.appendAudit(actor, "lead", lead.ID, &lead.FullName, "advanced", nil)
	h.store.mu.Unlock()
	writeJSON(w, http.StatusOK, lead)
}

func (h *Handlers) ConvertLead(w http.ResponseWriter, r *http.Request, actor *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	h.store.mu.Lock()
	lead, exists := h.store.leads[id]
	if !exists {
		h.store.mu.Unlock()
		writeErr(w, http.StatusNotFound, "lead not found")
		return
	}
	lead.Stage = "Converted"
	lead.UpdatedAt = nowISO()
	h.store.mu.Unlock()

	client := h.store.addClient(&Client{
		FullName:      lead.FullName,
		Email:         lead.Email,
		Phone:         lead.Phone,
		CaseOfficerID: lead.ConsultantID,
	})
	writeJSON(w, http.StatusOK, client)
}

func (h *Handlers) AddNote(w http.ResponseWriter, r *http.Request, actor *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	var body NoteBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	if strings.TrimSpace(body.Note) == "" {
		writeErr(w, http.StatusBadRequest, "empty note")
		return
	}
	h.store.addActivity(id, "note", body.Note)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handlers) BulkLeads(w http.ResponseWriter, r *http.Request, actor *User) {
	var body BulkRequestBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	h.store.mu.Lock()
	defer h.store.mu.Unlock()
	for _, id := range body.IDs {
		lead, exists := h.store.leads[id]
		if !exists {
			continue
		}
		switch body.Op {
		case "advance":
			lead.Stage = nextStage(lead.Stage)
			lead.UpdatedAt = nowISO()
		case "assign":
			lead.ConsultantID = body.ConsultantID
			lead.ConsultantName = h.store.userName(body.ConsultantID)
			lead.UpdatedAt = nowISO()
		case "delete":
			delete(h.store.leads, id)
			for tid, t := range h.store.tasks {
				if t.LeadID == id {
					delete(h.store.tasks, tid)
				}
			}
			for aid, a := range h.store.acts {
				if a.LeadID == id {
					delete(h.store.acts, aid)
				}
			}
		}
	}
	h.store.appendAudit(actor, "lead", 0, nil, "bulk:"+body.Op, map[string]interface{}{"ids": body.IDs})
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ============================================================
// TASKS
// ============================================================

func (h *Handlers) ListTasks(w http.ResponseWriter, r *http.Request, u *User) {
	writeJSON(w, http.StatusOK, h.store.listTasks())
}

func (h *Handlers) CreateTask(w http.ResponseWriter, r *http.Request, actor *User) {
	var body NewTaskBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	priority := "Medium"
	if body.Priority != nil && *body.Priority != "" {
		priority = *body.Priority
	}
	t := h.store.addTask(&Task{
		LeadID:      body.LeadID,
		Title:       body.Title,
		Description: body.Description,
		DueDate:     body.DueDate,
		Priority:    priority,
		Status:      "Pending",
	})
	writeJSON(w, http.StatusOK, t)
}

func (h *Handlers) UpdateTaskStatus(w http.ResponseWriter, r *http.Request, actor *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	var body TaskStatusBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	h.store.mu.Lock()
	t, exists := h.store.tasks[id]
	if exists {
		t.Status = body.Status
	}
	h.store.mu.Unlock()
	if !exists {
		writeErr(w, http.StatusNotFound, "task not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handlers) DeleteTask(w http.ResponseWriter, r *http.Request, actor *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	h.store.mu.Lock()
	delete(h.store.tasks, id)
	h.store.mu.Unlock()
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ============================================================
// CLIENTS / CASES
// ============================================================

func (h *Handlers) ListClients(w http.ResponseWriter, r *http.Request, u *User) {
	writeJSON(w, http.StatusOK, h.store.listClients())
}

func (h *Handlers) GetClientDetail(w http.ResponseWriter, r *http.Request, u *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	det, ok := h.store.clientDetail(id)
	if !ok {
		writeErr(w, http.StatusNotFound, "client not found")
		return
	}
	writeJSON(w, http.StatusOK, det)
}

func (h *Handlers) CreateClient(w http.ResponseWriter, r *http.Request, actor *User) {
	var body NewClientBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	c := h.store.addClient(&Client{
		FullName:      body.FullName,
		Email:         body.Email,
		Phone:         body.Phone,
		CaseOfficerID: body.CaseOfficer,
	})
	writeJSON(w, http.StatusOK, c)
}

func (h *Handlers) UpdateClient(w http.ResponseWriter, r *http.Request, actor *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	var body NewClientBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	h.store.mu.Lock()
	c, exists := h.store.clients[id]
	if exists {
		c.FullName = body.FullName
		c.Email = body.Email
		c.Phone = body.Phone
		c.CaseOfficerID = body.CaseOfficer
		c.CaseOfficerName = h.store.userName(body.CaseOfficer)
	}
	h.store.mu.Unlock()
	if !exists {
		writeErr(w, http.StatusNotFound, "client not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handlers) DeleteClient(w http.ResponseWriter, r *http.Request, actor *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	h.store.mu.Lock()
	delete(h.store.clients, id)
	for cid, c := range h.store.cases {
		if c.ClientID == id {
			delete(h.store.cases, cid)
		}
	}
	h.store.mu.Unlock()
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handlers) UpsertCase(w http.ResponseWriter, r *http.Request, actor *User) {
	clientID, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	var body CaseInputBody
	if err := decodeBody(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "bad request body")
		return
	}
	h.store.mu.Lock()
	if body.CaseID != nil && *body.CaseID > 0 {
		if c, exists := h.store.cases[*body.CaseID]; exists {
			c.Category = body.ServiceCategory
			c.Destination = body.Destination
			c.Stage = derefStr(body.Stage)
			c.Deadline = body.NextDeadline
		}
	} else {
		h.store.nextCaseID++
		cat := derefStr(body.ServiceCategory)
		dst := derefStr(body.Destination)
		h.store.cases[h.store.nextCaseID] = &CaseRow{
			ID:          h.store.nextCaseID,
			ClientID:    clientID,
			Category:    &cat,
			Destination: &dst,
			Stage:       derefStr(body.Stage),
			Deadline:    body.NextDeadline,
			CreatedAt:   nowISO(),
		}
	}
	h.store.mu.Unlock()

	det, ok := h.store.clientDetail(clientID)
	if !ok {
		writeErr(w, http.StatusNotFound, "client not found")
		return
	}
	writeJSON(w, http.StatusOK, det)
}

func (h *Handlers) DeleteCase(w http.ResponseWriter, r *http.Request, actor *User) {
	id, ok := idFromPath(r)
	if !ok {
		writeErr(w, http.StatusBadRequest, "bad id")
		return
	}
	h.store.mu.Lock()
	delete(h.store.cases, id)
	h.store.mu.Unlock()
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ============================================================
// STATS / AUDIT
// ============================================================

func (h *Handlers) Stats(w http.ResponseWriter, r *http.Request, u *User) {
	writeJSON(w, http.StatusOK, h.store.stats())
}

func (h *Handlers) Audit(w http.ResponseWriter, r *http.Request, u *User) {
	limitStr := r.URL.Query().Get("limit")
	limit, _ := strconv.Atoi(limitStr)
	writeJSON(w, http.StatusOK, h.store.auditList(limit))
}
