package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type taskRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	DueDate     string `json:"dueDate"`
	ContactID   string `json:"contactId"`
	Owner       string `json:"owner"`
}

type taskStatusRequest struct {
	Status string `json:"status"`
}

var validTaskStatuses = []string{"todo", "in_progress", "done"}

func isValidTaskStatus(s string) bool {
	for _, v := range validTaskStatuses {
		if v == s {
			return true
		}
	}
	return false
}

func validateTask(req taskRequest) map[string]string {
	fields := map[string]string{}
	title := strings.TrimSpace(req.Title)
	status := strings.TrimSpace(req.Status)
	contactID := strings.TrimSpace(req.ContactID)
	if title == "" {
		fields["title"] = "Title is required"
	} else if len(title) > 200 {
		fields["title"] = "Title must be 200 characters or fewer"
	}
	if status != "" && !isValidTaskStatus(status) {
		fields["status"] = "Invalid status"
	}
	if contactID != "" {
		if _, ok := findContactByID(contactID); !ok {
			fields["contactId"] = "Contact not found"
		}
	}
	return fields
}

func listTasks(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))
	limit, offset := parseLimitOffset(r, 50, 0)
	mu.RLock()
	defer mu.RUnlock()
	filtered := make([]Task, 0, len(tasks))
	for _, t := range tasks {
		if statusFilter != "" && t.Status != statusFilter {
			continue
		}
		if q == "" ||
			strings.Contains(strings.ToLower(t.Title), q) ||
			strings.Contains(strings.ToLower(t.Description), q) ||
			strings.Contains(strings.ToLower(t.ContactName), q) ||
			strings.Contains(strings.ToLower(t.Owner), q) {
			filtered = append(filtered, t)
		}
	}
	total := len(filtered)
	writeJSON(w, http.StatusOK, map[string]any{
		"tasks": slicePage(filtered, offset, limit), "total": total, "limit": limit, "offset": offset,
	})
}

func getTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	mu.RLock()
	defer mu.RUnlock()
	for _, t := range tasks {
		if t.ID == id {
			writeJSON(w, http.StatusOK, map[string]any{"task": t})
			return
		}
	}
	writeError(w, http.StatusNotFound, "Task not found")
}

func createTask(w http.ResponseWriter, r *http.Request) {
	var req taskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	mu.Lock()
	defer mu.Unlock()
	if fields := validateTask(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}
	status := strings.TrimSpace(req.Status)
	if status == "" {
		status = "todo"
	}
	contactID := strings.TrimSpace(req.ContactID)
	contactName := ""
	if contactID != "" {
		if c, ok := findContactByID(contactID); ok {
			contactName = c.Name
		}
	}
	now := time.Now().Format("2006-01-02")
	newTask := Task{
		ID: newID("t"), Title: strings.TrimSpace(req.Title), Description: req.Description,
		Status: status, DueDate: strings.TrimSpace(req.DueDate),
		ContactID: contactID, ContactName: contactName,
		Owner: strings.TrimSpace(req.Owner), CreatedAt: now,
	}
	tasks = append(tasks, newTask)
	writeJSON(w, http.StatusCreated, map[string]any{"task": newTask})
}

func updateTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	mu.Lock()
	defer mu.Unlock()
	idx := -1
	for i, t := range tasks {
		if t.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Task not found")
		return
	}
	var req taskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if fields := validateTask(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}
	status := strings.TrimSpace(req.Status)
	if status == "" {
		status = "todo"
	}
	contactID := strings.TrimSpace(req.ContactID)
	contactName := ""
	if contactID != "" {
		if c, ok := findContactByID(contactID); ok {
			contactName = c.Name
		}
	}
	updated := tasks[idx]
	updated.Title = strings.TrimSpace(req.Title)
	updated.Description = req.Description
	updated.Status = status
	updated.DueDate = strings.TrimSpace(req.DueDate)
	updated.ContactID = contactID
	updated.ContactName = contactName
	updated.Owner = strings.TrimSpace(req.Owner)
	tasks[idx] = updated
	writeJSON(w, http.StatusOK, map[string]any{"task": updated})
}

func updateTaskStatus(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	mu.Lock()
	defer mu.Unlock()
	idx := -1
	for i, t := range tasks {
		if t.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Task not found")
		return
	}
	var req taskStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	status := strings.TrimSpace(req.Status)
	if !isValidTaskStatus(status) {
		writeFieldErrors(w, map[string]string{"status": "Invalid status"})
		return
	}
	tasks[idx].Status = status
	writeJSON(w, http.StatusOK, map[string]any{"task": tasks[idx]})
}

func deleteTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	mu.Lock()
	defer mu.Unlock()
	idx := -1
	for i, t := range tasks {
		if t.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Task not found")
		return
	}
	tasks = append(tasks[:idx], tasks[idx+1:]...)
	writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}
