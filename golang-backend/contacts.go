package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type contactRequest struct {
	Name     string   `json:"name"`
	Email    string   `json:"email"`
	Company  string   `json:"company"`
	Title    string   `json:"title"`
	Phone    string   `json:"phone"`
	Location string   `json:"location"`
	Stage    string   `json:"stage"`
	Tags     []string `json:"tags"`
	Notes    string   `json:"notes"`
}

var validStages = []string{"Lead", "Qualified", "Proposal", "Customer"}

// validateContact must be called with mu held (read or write).
func validateContact(req contactRequest, excludeID string) map[string]string {
	fields := map[string]string{}

	name := strings.TrimSpace(req.Name)
	email := strings.TrimSpace(req.Email)
	stage := strings.TrimSpace(req.Stage)

	if name == "" {
		fields["name"] = "Name is required"
	} else if len(name) > 100 {
		fields["name"] = "Name must be 100 characters or fewer"
	}

	if email == "" {
		fields["email"] = "Email is required"
	} else if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		fields["email"] = "Please enter a valid email"
	} else {
		for _, c := range contacts {
			if strings.EqualFold(c.Email, email) && c.ID != excludeID {
				fields["email"] = "A contact with this email already exists"
				break
			}
		}
	}

	if stage != "" {
		valid := false
		for _, s := range validStages {
			if s == stage {
				valid = true
				break
			}
		}
		if !valid {
			fields["stage"] = "Invalid stage"
		}
	}

	return fields
}

func writeFieldErrors(w http.ResponseWriter, fields map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(w).Encode(map[string]any{
		"error":  "Validation failed",
		"fields": fields,
	})
}

func listContacts(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	limit, offset := parseLimitOffset(r, 50, 0)

	mu.RLock()
	defer mu.RUnlock()

	filtered := make([]Contact, 0, len(contacts))
	for _, c := range contacts {
		if q == "" ||
			strings.Contains(strings.ToLower(c.Name), q) ||
			strings.Contains(strings.ToLower(c.Email), q) ||
			strings.Contains(strings.ToLower(c.Company), q) {
			filtered = append(filtered, c)
		}
	}
	total := len(filtered)
	writeJSON(w, http.StatusOK, map[string]any{
		"contacts": slicePage(filtered, offset, limit),
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}

func getContact(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.RLock()
	defer mu.RUnlock()

	for _, c := range contacts {
		if c.ID == id {
			writeJSON(w, http.StatusOK, map[string]any{"contact": c})
			return
		}
	}
	writeError(w, http.StatusNotFound, "Contact not found")
}

func createContact(w http.ResponseWriter, r *http.Request) {
	var req contactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	if fields := validateContact(req, ""); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	stage := strings.TrimSpace(req.Stage)
	if stage == "" {
		stage = "Lead"
	}
	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	now := time.Now().Format("2006-01-02")
	newContact := Contact{
		ID:          newID("c"),
		Name:        strings.TrimSpace(req.Name),
		Email:       strings.TrimSpace(req.Email),
		Company:     strings.TrimSpace(req.Company),
		Title:       strings.TrimSpace(req.Title),
		Phone:       strings.TrimSpace(req.Phone),
		Location:    strings.TrimSpace(req.Location),
		Stage:       stage,
		LastContact: now,
		Owner:       "Demo User",
		Tags:        tags,
		Notes:       req.Notes,
		CreatedAt:   now,
	}

	contacts = append(contacts, newContact)

	writeJSON(w, http.StatusCreated, map[string]any{"contact": newContact})
}

func updateContact(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, c := range contacts {
		if c.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Contact not found")
		return
	}

	var req contactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if fields := validateContact(req, id); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	updated := contacts[idx]
	updated.Name = strings.TrimSpace(req.Name)
	updated.Email = strings.TrimSpace(req.Email)
	updated.Company = strings.TrimSpace(req.Company)
	updated.Title = strings.TrimSpace(req.Title)
	updated.Phone = strings.TrimSpace(req.Phone)
	updated.Location = strings.TrimSpace(req.Location)
	updated.Tags = tags
	updated.Notes = req.Notes

	if stage := strings.TrimSpace(req.Stage); stage != "" {
		updated.Stage = stage
	}

	contacts[idx] = updated

	writeJSON(w, http.StatusOK, map[string]any{"contact": updated})
}

func deleteContact(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, c := range contacts {
		if c.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Contact not found")
		return
	}

	contacts = append(contacts[:idx], contacts[idx+1:]...)

	keptActivities := activities[:0]
	for _, a := range activities {
		if a.ContactID != id {
			keptActivities = append(keptActivities, a)
		}
	}
	activities = keptActivities

	keptTasks := tasks[:0]
	for _, t := range tasks {
		if t.ContactID != id {
			keptTasks = append(keptTasks, t)
		}
	}
	tasks = keptTasks

	for i := range deals {
		if deals[i].ContactID == id {
			deals[i].ContactID = ""
			deals[i].ContactName = ""
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}
