package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type documentRequest struct {
	CaseID               string `json:"caseId"`
	DocName              string `json:"docName"`
	Required             bool   `json:"required"`
	DateRequested        string `json:"dateRequested"`
	DateReceived         string `json:"dateReceived"`
	ExpiryDate           string `json:"expiryDate"`
	VerifiedBy           string `json:"verifiedBy"`
	VerificationDate     string `json:"verificationDate"`
	Status               string `json:"status"`
	RejectionReason      string `json:"rejectionReason"`
	TranslationRequired  bool   `json:"translationRequired"`
	LegalizationRequired bool   `json:"legalizationRequired"`
	FilePath             string `json:"filePath"`
	Notes                string `json:"notes"`
}

type documentStatusRequest struct {
	Status          string `json:"status"`
	RejectionReason string `json:"rejectionReason"`
}

var validDocumentStatuses = []string{
	"Not Requested", "Requested", "Received",
	"Under Review", "Correction Required", "Verified", "Expired",
}

func isValidDocumentStatus(s string) bool {
	for _, v := range validDocumentStatuses {
		if v == s {
			return true
		}
	}
	return false
}

// validateDocument must be called with mu held.
func validateDocument(req documentRequest) map[string]string {
	fields := map[string]string{}

	caseID := strings.TrimSpace(req.CaseID)
	docName := strings.TrimSpace(req.DocName)
	status := strings.TrimSpace(req.Status)

	if caseID == "" {
		fields["caseId"] = "Case is required"
	} else if _, ok := findCaseByID(caseID); !ok {
		fields["caseId"] = "Case not found"
	}

	if docName == "" {
		fields["docName"] = "Document name is required"
	}

	if status == "" {
		fields["status"] = "Status is required"
	} else if !isValidDocumentStatus(status) {
		fields["status"] = "Invalid status"
	}

	return fields
}

func listDocumentsHandler(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	caseID := strings.TrimSpace(r.URL.Query().Get("caseId"))
	status := strings.TrimSpace(r.URL.Query().Get("status"))
	limit, offset := parseLimitOffset(r, 50, 0)

	all := listDocuments()
	filtered := make([]Document, 0, len(all))
	for _, d := range all {
		if caseID != "" && d.CaseID != caseID {
			continue
		}
		if status != "" && d.Status != status {
			continue
		}
		if q == "" ||
			strings.Contains(strings.ToLower(d.DocName), q) ||
			strings.Contains(strings.ToLower(d.CaseNumber), q) {
			filtered = append(filtered, d)
		}
	}
	total := len(filtered)
	writeJSON(w, http.StatusOK, map[string]any{
		"documents": slicePage(filtered, offset, limit),
		"total":     total,
		"limit":     limit,
		"offset":    offset,
	})
}

func getDocumentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	mu.RLock()
	defer mu.RUnlock()
	for _, d := range documents {
		if d.ID == id {
			writeJSON(w, http.StatusOK, map[string]any{"document": d})
			return
		}
	}
	writeError(w, http.StatusNotFound, "Document not found")
}

func createDocumentHandler(w http.ResponseWriter, r *http.Request) {
	var req documentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	email, _ := r.Context().Value(ctxUserEmail).(string)
	createdBy := "Unknown"
	if email != "" {
		if u, ok := findUserByEmail(email); ok {
			createdBy = u.Name
		}
	}

	mu.Lock()
	defer mu.Unlock()

	if fields := validateDocument(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	caseID := strings.TrimSpace(req.CaseID)
	caseNumber := ""
	if c, ok := findCaseByID(caseID); ok {
		caseNumber = c.CaseNumber
	}

	now := time.Now().Format("2006-01-02")
	newDoc := Document{
		ID:                   newID("doc"),
		CaseID:               caseID,
		CaseNumber:           caseNumber,
		DocName:              strings.TrimSpace(req.DocName),
		Required:             req.Required,
		DateRequested:        normalizeDate(req.DateRequested),
		DateReceived:         strings.TrimSpace(req.DateReceived),
		ExpiryDate:           strings.TrimSpace(req.ExpiryDate),
		VerifiedBy:           strings.TrimSpace(req.VerifiedBy),
		VerificationDate:     strings.TrimSpace(req.VerificationDate),
		Status:               strings.TrimSpace(req.Status),
		RejectionReason:      strings.TrimSpace(req.RejectionReason),
		LatestVersion:        1,
		TranslationRequired:  req.TranslationRequired,
		LegalizationRequired: req.LegalizationRequired,
		FilePath:             strings.TrimSpace(req.FilePath),
		Notes:                req.Notes,
		CreatedBy:            createdBy,
		CreatedAt:            now,
	}

	documents = append(documents, newDoc)
	writeJSON(w, http.StatusCreated, map[string]any{"document": newDoc})
}

func updateDocumentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req documentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, d := range documents {
		if d.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Document not found")
		return
	}

	if fields := validateDocument(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	caseID := strings.TrimSpace(req.CaseID)
	caseNumber := ""
	if c, ok := findCaseByID(caseID); ok {
		caseNumber = c.CaseNumber
	}

	updated := documents[idx]
	updated.CaseID = caseID
	updated.CaseNumber = caseNumber
	updated.DocName = strings.TrimSpace(req.DocName)
	updated.Required = req.Required
	updated.DateRequested = strings.TrimSpace(req.DateRequested)
	updated.DateReceived = strings.TrimSpace(req.DateReceived)
	updated.ExpiryDate = strings.TrimSpace(req.ExpiryDate)
	updated.VerifiedBy = strings.TrimSpace(req.VerifiedBy)
	updated.VerificationDate = strings.TrimSpace(req.VerificationDate)
	updated.Status = strings.TrimSpace(req.Status)
	updated.RejectionReason = strings.TrimSpace(req.RejectionReason)
	updated.TranslationRequired = req.TranslationRequired
	updated.LegalizationRequired = req.LegalizationRequired
	updated.FilePath = strings.TrimSpace(req.FilePath)
	updated.Notes = req.Notes

	documents[idx] = updated
	writeJSON(w, http.StatusOK, map[string]any{"document": updated})
}

func updateDocumentStatusHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req documentStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, d := range documents {
		if d.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Document not found")
		return
	}

	status := strings.TrimSpace(req.Status)
	if !isValidDocumentStatus(status) {
		writeFieldErrors(w, map[string]string{"status": "Invalid status"})
		return
	}

	documents[idx].Status = status
	if status == "Correction Required" {
		documents[idx].RejectionReason = strings.TrimSpace(req.RejectionReason)
	}
	if status == "Verified" {
		documents[idx].VerificationDate = time.Now().Format("2006-01-02")
	}

	writeJSON(w, http.StatusOK, map[string]any{"document": documents[idx]})
}

func deleteDocumentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, d := range documents {
		if d.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Document not found")
		return
	}

	documents = append(documents[:idx], documents[idx+1:]...)
	writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}
