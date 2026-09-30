package main

import (
	"log"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type dealRequest struct {
	Title     string  `json:"title"`
	ContactID string  `json:"contactId"`
	Value     float64 `json:"value"`
	Currency  string  `json:"currency"`
	Stage     string  `json:"stage"`
	CloseDate string  `json:"closeDate"`
	Owner     string  `json:"owner"`
	Notes     string  `json:"notes"`
}

type dealStageRequest struct {
	Stage string `json:"stage"`
}

var validDealStages = []string{"Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"}
var validDealCurrencies = []string{"USD", "EUR", "GBP", "AED", "AUD", "CAD", "PHP", "INR", "SGD", "JPY"}

func isValidDealStage(stage string) bool {
	for _, s := range validDealStages {
		if s == stage {
			return true
		}
	}
	return false
}

func isValidDealCurrency(c string) bool {
	for _, v := range validDealCurrencies {
		if v == c {
			return true
		}
	}
	return false
}

// findContactByID must be called with mu held.
func findContactByID(id string) (Contact, bool) {
	for _, c := range contacts {
		if c.ID == id {
			return c, true
		}
	}
	return Contact{}, false
}

// validateDeal must be called with mu held.
func validateDeal(req dealRequest) map[string]string {
	fields := map[string]string{}

	title := strings.TrimSpace(req.Title)
	stage := strings.TrimSpace(req.Stage)
	contactID := strings.TrimSpace(req.ContactID)
	currency := strings.TrimSpace(req.Currency)

	if title == "" {
		fields["title"] = "Title is required"
	} else if len(title) > 200 {
		fields["title"] = "Title must be 200 characters or fewer"
	}

	if req.Value < 0 {
		fields["value"] = "Value can't be negative"
	}

	if stage != "" && !isValidDealStage(stage) {
		fields["stage"] = "Invalid stage"
	}

	if currency != "" && !isValidDealCurrency(currency) {
		fields["currency"] = "Invalid currency"
	}

	if contactID != "" {
		if _, ok := findContactByID(contactID); !ok {
			fields["contactId"] = "Contact not found"
		}
	}

	return fields
}

func listDeals(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	limit, offset := parseLimitOffset(r, 50, 0)

	mu.RLock()
	defer mu.RUnlock()

	filtered := make([]Deal, 0, len(deals))
	for _, d := range deals {
		if q == "" ||
			strings.Contains(strings.ToLower(d.Title), q) ||
			strings.Contains(strings.ToLower(d.ContactName), q) ||
			strings.Contains(strings.ToLower(d.Owner), q) {
			filtered = append(filtered, d)
		}
	}
	total := len(filtered)
	writeJSON(w, http.StatusOK, map[string]any{
		"deals":  slicePage(filtered, offset, limit),
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

func getDeal(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.RLock()
	defer mu.RUnlock()

	for _, d := range deals {
		if d.ID == id {
			writeJSON(w, http.StatusOK, map[string]any{"deal": d})
			return
		}
	}
	writeError(w, http.StatusNotFound, "Deal not found")
}

func createDeal(w http.ResponseWriter, r *http.Request) {
	var req dealRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	if fields := validateDeal(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	stage := strings.TrimSpace(req.Stage)
	if stage == "" {
		stage = "Lead"
	}
	currency := strings.TrimSpace(req.Currency)
	if currency == "" {
		currency = "USD"
	}
	contactID := strings.TrimSpace(req.ContactID)
	contactName := ""
	if contactID != "" {
		if c, ok := findContactByID(contactID); ok {
			contactName = c.Name
		}
	}

	now := time.Now().Format("2006-01-02")
	newDeal := Deal{
		ID:          newID("d"),
		Title:       strings.TrimSpace(req.Title),
		ContactID:   contactID,
		ContactName: contactName,
		Value:       req.Value,
		Currency:    currency,
		Stage:       stage,
		CloseDate:   strings.TrimSpace(req.CloseDate),
		Owner:       strings.TrimSpace(req.Owner),
		Notes:       req.Notes,
		CreatedAt:   now,
	}

	deals = append(deals, newDeal)

	writeJSON(w, http.StatusCreated, map[string]any{"deal": newDeal})
}

func updateDeal(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, d := range deals {
		if d.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Deal not found")
		return
	}

	var req dealRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if fields := validateDeal(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	stage := strings.TrimSpace(req.Stage)
	if stage == "" {
		stage = "Lead"
	}

	currency := strings.TrimSpace(req.Currency)
	if currency == "" {
		currency = "USD"
	}

	contactID := strings.TrimSpace(req.ContactID)
	contactName := ""
	if contactID != "" {
		if c, ok := findContactByID(contactID); ok {
			contactName = c.Name
		}
	}

	updated := deals[idx]
	updated.Title = strings.TrimSpace(req.Title)
	updated.ContactID = contactID
	updated.ContactName = contactName
	updated.Value = req.Value
	updated.Currency = currency
	updated.Stage = stage
	updated.CloseDate = strings.TrimSpace(req.CloseDate)
	updated.Owner = strings.TrimSpace(req.Owner)
	updated.Notes = req.Notes

	deals[idx] = updated

	writeJSON(w, http.StatusOK, map[string]any{"deal": updated})
}

func updateDealStage(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, d := range deals {
		if d.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Deal not found")
		return
	}

	var req dealStageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	stage := strings.TrimSpace(req.Stage)
	if !isValidDealStage(stage) {
		writeFieldErrors(w, map[string]string{"stage": "Invalid stage"})
		return
	}

	deals[idx].Stage = stage

	writeJSON(w, http.StatusOK, map[string]any{"deal": deals[idx]})
}

func deleteDeal(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, d := range deals {
		if d.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Deal not found")
		return
	}

	deals = append(deals[:idx], deals[idx+1:]...)

	keptActivities := activities[:0]
	for _, a := range activities {
		if a.DealID != id {
			keptActivities = append(keptActivities, a)
		}
	}
	activities = keptActivities

	writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}


// ---- seed data & in-memory accessors (moved from store.go) ----

func seedDeals() {
	deals = []Deal{
		{
			ID: "d_1", Title: "Analytical Engines — Enterprise tier", ContactID: "c_1", ContactName: "Ada Lovelace",
			Value: 48000, Currency: "USD", Stage: "Negotiation", CloseDate: "2026-10-15", Owner: "Demo User",
			Notes:     "SSO and audit logs are the blockers. Legal reviewing redlines.",
			CreatedAt: "2026-08-01",
		},
		{
			ID: "d_2", Title: "US Navy — 3yr renewal", ContactID: "c_2", ContactName: "Grace Hopper",
			Value: 96000, Currency: "USD", Stage: "Won", CloseDate: "2026-06-02", Owner: "Demo User",
			Notes:     "Renewed for 3 years.",
			CreatedAt: "2025-05-01",
		},
		{
			ID: "d_3", Title: "Bletchley Park — Cryptography add-on", ContactID: "c_3", ContactName: "Alan Turing",
			Value: 22000, Currency: "GBP", Stage: "Qualified", CloseDate: "2026-11-01", Owner: "Demo User",
			Notes:     "Warm lead, evaluating cryptography features.",
			CreatedAt: "2026-08-12",
		},
		{
			ID: "d_4", Title: "NASA — Research suite", ContactID: "c_4", ContactName: "Katherine Johnson",
			Value: 61000, Currency: "USD", Stage: "Proposal", CloseDate: "2026-11-20", Owner: "Demo User",
			Notes:     "Proposal v2 sent. Waiting on procurement review.",
			CreatedAt: "2026-07-01",
		},
		{
			ID: "d_5", Title: "Linux Foundation — Trial", ContactID: "c_5", ContactName: "Linus Torvalds",
			Value: 8000, Currency: "USD", Stage: "Lead", CloseDate: "2026-12-01", Owner: "Demo User",
			Notes:     "Inbound from conference talk. Not yet qualified.",
			CreatedAt: "2026-08-22",
		},
		{
			ID: "d_6", Title: "MIT — Department rollout", ContactID: "c_6", ContactName: "Margaret Hamilton",
			Value: 120000, Currency: "USD", Stage: "Won", CloseDate: "2026-09-09", Owner: "Demo User",
			Notes:     "Champion for the department-wide rollout.",
			CreatedAt: "2025-11-20",
		},
		{
			ID: "d_7", Title: "Stanford — Evaluation", ContactID: "c_7", ContactName: "Donald Knuth",
			Value: 15000, Currency: "USD", Stage: "Lost", CloseDate: "2026-08-30", Owner: "Demo User",
			Notes:     "Went with an internal tool instead.",
			CreatedAt: "2026-08-25",
		},
	}
	log.Println("Seeded 7 deals")
}
