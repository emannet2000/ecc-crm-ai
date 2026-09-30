package main

import (
	"log"
	"encoding/json"
	"net/http"
	"sort"
	"strings"
	"time"
)

type activityRequest struct {
	Kind       string `json:"kind"`
	Title      string `json:"title"`
	Body       string `json:"body"`
	OccurredAt string `json:"occurredAt"`
	DealID     string `json:"dealId"`
}

var validActivityKinds = []string{"email", "call", "meeting", "note", "task"}

func isValidActivityKind(k string) bool {
	for _, v := range validActivityKinds {
		if v == k {
			return true
		}
	}
	return false
}

// validateActivity must be called with mu held.
func validateActivity(req activityRequest) map[string]string {
	fields := map[string]string{}
	kind := strings.TrimSpace(req.Kind)
	title := strings.TrimSpace(req.Title)

	if kind == "" {
		fields["kind"] = "Kind is required"
	} else if !isValidActivityKind(kind) {
		fields["kind"] = "Invalid kind"
	}

	if title == "" {
		fields["title"] = "Title is required"
	} else if len(title) > 200 {
		fields["title"] = "Title must be 200 characters or fewer"
	}

	return fields
}

// normalizeDate returns an ISO-8601 date (YYYY-MM-DD).
func normalizeDate(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return time.Now().Format("2006-01-02")
	}
	if len(s) > 10 {
		return s[:10]
	}
	return s
}

func listActivities(w http.ResponseWriter, r *http.Request) {
	contactID := r.PathValue("id")

	mu.RLock()
	defer mu.RUnlock()

	found := false
	for _, c := range contacts {
		if c.ID == contactID {
			found = true
			break
		}
	}
	if !found {
		writeError(w, http.StatusNotFound, "Contact not found")
		return
	}

	filtered := make([]Activity, 0)
	for _, a := range activities {
		if a.ContactID == contactID {
			filtered = append(filtered, a)
		}
	}
	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].OccurredAt > filtered[j].OccurredAt
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"activities": filtered,
		"total":      len(filtered),
	})
}

func createActivity(w http.ResponseWriter, r *http.Request) {
	contactID := r.PathValue("id")

	var req activityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	contactIdx := -1
	for i, c := range contacts {
		if c.ID == contactID {
			contactIdx = i
			break
		}
	}
	if contactIdx == -1 {
		writeError(w, http.StatusNotFound, "Contact not found")
		return
	}

	if fields := validateActivity(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	dealID := strings.TrimSpace(req.DealID)
	if dealID != "" {
		ok := false
		for _, d := range deals {
			if d.ID == dealID {
				ok = true
				break
			}
		}
		if !ok {
			writeFieldErrors(w, map[string]string{"dealId": "Deal not found"})
			return
		}
	}

	occurredAt := normalizeDate(req.OccurredAt)
	now := time.Now().Format("2006-01-02")

	newActivity := Activity{
		ID:         newID("a"),
		ContactID:  contactID,
		DealID:     dealID,
		Kind:       strings.TrimSpace(req.Kind),
		Title:      strings.TrimSpace(req.Title),
		Body:       req.Body,
		OccurredAt: occurredAt,
		CreatedBy:  "Demo User",
		CreatedAt:  now,
	}
	activities = append(activities, newActivity)

	if occurredAt > contacts[contactIdx].LastContact {
		contacts[contactIdx].LastContact = occurredAt
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"activity": newActivity,
		"contact":  contacts[contactIdx],
	})
}

func deleteActivity(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, a := range activities {
		if a.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Activity not found")
		return
	}

	activities = append(activities[:idx], activities[idx+1:]...)
	writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}


// ---- seed data & in-memory accessors (moved from store.go) ----

func seedActivities() {
	activities = []Activity{
		{
			ID: "a_1", ContactID: "c_1", DealID: "d_1",
			Kind: "email", Title: "Proposal sent",
			Body:       "Sent the v2 pricing proposal — enterprise tier with SSO and audit logs.",
			OccurredAt: "2026-09-08", CreatedBy: "Demo User", CreatedAt: "2026-09-08",
		},
		{
			ID: "a_2", ContactID: "c_1", DealID: "d_1",
			Kind: "call", Title: "Discovery call",
			Body:       "Walked through current workflow. Pain points: reporting and permissions.",
			OccurredAt: "2026-09-05", CreatedBy: "Demo User", CreatedAt: "2026-09-05",
		},
		{
			ID: "a_3", ContactID: "c_1", DealID: "",
			Kind: "meeting", Title: "Product demo",
			Body:       "Showed the pipeline view and contact detail. Positive feedback.",
			OccurredAt: "2026-08-28", CreatedBy: "Demo User", CreatedAt: "2026-08-28",
		},
		{
			ID: "a_4", ContactID: "c_3", DealID: "d_3",
			Kind: "note", Title: "Evaluating cryptography features",
			Body:       "Sent whitepaper on AES-256 at rest and TLS 1.3.",
			OccurredAt: "2026-09-01", CreatedBy: "Demo User", CreatedAt: "2026-09-01",
		},
		{
			ID: "a_5", ContactID: "c_4", DealID: "d_4",
			Kind: "email", Title: "Proposal v2 sent",
			Body:       "Procurement requested updated terms. Waiting on legal review.",
			OccurredAt: "2026-08-28", CreatedBy: "Demo User", CreatedAt: "2026-08-28",
		},
		{
			ID: "a_6", ContactID: "c_6", DealID: "d_6",
			Kind: "meeting", Title: "Rollout kickoff",
			Body:       "Confirmed timeline and success metrics with department heads.",
			OccurredAt: "2026-09-09", CreatedBy: "Demo User", CreatedAt: "2026-09-09",
		},
		{
			ID: "a_7", ContactID: "c_2", DealID: "d_2",
			Kind: "note", Title: "Renewal signed",
			Body:       "3-year renewal closed. Contract on file.",
			OccurredAt: "2026-06-02", CreatedBy: "Demo User", CreatedAt: "2026-06-02",
		},
	}
	log.Println("Seeded 7 activities")
}
