 package main

import (
    "encoding/json"
    "net/http"
    "strings"
    "time"
)

type dealRequest struct {
    Title     string  `json:"title"`
    ContactID string  `json:"contactId"`
    Value     float64 `json:"value"`
    Stage     string  `json:"stage"`
    CloseDate string  `json:"closeDate"`
    Owner     string  `json:"owner"`
    Notes     string  `json:"notes"`
}

type dealStageRequest struct {
    Stage string `json:"stage"`
}

var validDealStages = []string{"Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"}

func isValidDealStage(stage string) bool {
    for _, s := range validDealStages {
        if s == stage {
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

    // Hold the write lock across validate + contact lookup + insert so a
    // concurrent delete of the referenced contact can't slip through.
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

    // Already holding the exclusive lock for the whole handler, so
    // validateDeal's contact lookup below reads `contacts` safely.
    if fields := validateDeal(req); len(fields) > 0 {
        writeFieldErrors(w, fields)
        return
    }

    stage := strings.TrimSpace(req.Stage)
    if stage == "" {
        stage = "Lead"
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
    writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}