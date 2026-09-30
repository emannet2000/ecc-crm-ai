package main

import (
	"log"
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


// ---- seed data & in-memory accessors (moved from store.go) ----

func seedContacts() {
	contacts = []Contact{
		{
			ID: "c_1", Name: "Ada Lovelace", Email: "ada@analytical.io",
			Company: "Analytical Engines", Title: "Chief Scientist",
			Phone: "+44 20 7946 0958", Location: "London, UK",
			Stage: "Customer", LastContact: "2026-09-08", Owner: "Demo User",
			Tags:      []string{"VIP", "Technical", "Q4-target"},
			Notes:     "Met at Q3 conference. Decision maker for technical purchases. Interested in the enterprise tier with SSO and audit logs.",
			CreatedAt: "2026-01-15",
		},
		{
			ID: "c_2", Name: "Grace Hopper", Email: "grace@navy.mil",
			Company: "US Navy", Title: "Rear Admiral",
			Phone: "+1 202 555 0142", Location: "Washington, DC",
			Stage: "Customer", LastContact: "2026-09-05", Owner: "Demo User",
			Tags:      []string{"VIP", "Government"},
			Notes:     "Long-time customer. Renewed for 3 years.",
			CreatedAt: "2025-06-02",
		},
		{
			ID: "c_3", Name: "Alan Turing", Email: "alan@bletchley.uk",
			Company: "Bletchley Park", Title: "Research Lead",
			Phone: "+44 1908 640404", Location: "Milton Keynes, UK",
			Stage: "Qualified", LastContact: "2026-09-01", Owner: "Demo User",
			Tags:      []string{"Technical", "Research"},
			Notes:     "Evaluating our cryptography features. Warm lead.",
			CreatedAt: "2026-08-12",
		},
		{
			ID: "c_4", Name: "Katherine Johnson", Email: "kj@nasa.gov",
			Company: "NASA", Title: "Research Mathematician",
			Phone: "+1 281 483 0121", Location: "Houston, TX",
			Stage: "Proposal", LastContact: "2026-08-28", Owner: "Demo User",
			Tags:      []string{"Aerospace", "Q4-target"},
			Notes:     "Proposal v2 sent. Waiting on procurement review.",
			CreatedAt: "2026-07-01",
		},
		{
			ID: "c_5", Name: "Linus Torvalds", Email: "linus@kernel.org",
			Company: "Linux Foundation", Title: "Principal Engineer",
			Phone: "+1 415 555 0198", Location: "Portland, OR",
			Stage: "Lead", LastContact: "2026-08-22", Owner: "Demo User",
			Tags:      []string{"Open Source"},
			Notes:     "Inbound from conference talk. Not yet qualified.",
			CreatedAt: "2026-08-22",
		},
		{
			ID: "c_6", Name: "Margaret Hamilton", Email: "mh@mit.edu",
			Company: "MIT", Title: "Professor",
			Phone: "+1 617 253 1000", Location: "Cambridge, MA",
			Stage: "Customer", LastContact: "2026-09-09", Owner: "Demo User",
			Tags:      []string{"Academic", "VIP"},
			Notes:     "Champion for the department-wide rollout.",
			CreatedAt: "2025-11-20",
		},
		{
			ID: "c_7", Name: "Donald Knuth", Email: "knuth@stanford.edu",
			Company: "Stanford", Title: "Professor Emeritus",
			Phone: "+1 650 723 2300", Location: "Stanford, CA",
			Stage: "Qualified", LastContact: "2026-08-30", Owner: "Demo User",
			Tags:      []string{"Academic"},
			Notes:     "",
			CreatedAt: "2026-08-25",
		},
		{
			ID: "c_8", Name: "Barbara Liskov", Email: "liskov@mit.edu",
			Company: "MIT", Title: "Institute Professor",
			Phone: "+1 617 253 1000", Location: "Cambridge, MA",
			Stage: "Proposal", LastContact: "2026-08-25", Owner: "Demo User",
			Tags:      []string{"Academic", "Technical"},
			Notes:     "Interested in the API integrations story.",
			CreatedAt: "2026-06-14",
		},
	}
	log.Println("Seeded 8 contacts")
}
