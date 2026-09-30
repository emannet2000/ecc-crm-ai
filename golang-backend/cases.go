package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type caseRequest struct {
	CaseNumber         string `json:"caseNumber"`
	ClientID           string `json:"clientId"`
	ServiceCategory    string `json:"serviceCategory"`
	DestinationCountry string `json:"destinationCountry"`
	VisaType           string `json:"visaType"`
	SchoolOrEmployer   string `json:"schoolOrEmployer"`
	AssignedOfficer    string `json:"assignedOfficer"`
	ExternalAdviser    string `json:"externalAdviser"`
	DateOpened         string `json:"dateOpened"`
	TargetSubmission   string `json:"targetSubmission"`
	ActualSubmission   string `json:"actualSubmission"`
	GovernmentRef      string `json:"governmentRef"`
	CurrentStage       string `json:"currentStage"`
	Priority           string `json:"priority"`
	NextAction         string `json:"nextAction"`
	NextDeadline       string `json:"nextDeadline"`
	Result             string `json:"result"`
	ClosureDate        string `json:"closureDate"`
	Notes              string `json:"notes"`
}

type caseStageRequest struct {
	CurrentStage string `json:"currentStage"`
}

var validCaseStages = []string{
	"Assessment", "Eligibility Review", "Agreement Pending",
	"Documents Pending", "Documents Under Review",
	"Application Preparation", "Partner Review",
	"Ready for Submission", "Submitted",
	"Additional Documents Requested", "Decision Pending",
	"Approved", "Refused", "Closed",
}

var validCasePriorities = []string{"Low", "Medium", "High", "Urgent"}

func isValidCaseStage(s string) bool {
	for _, v := range validCaseStages {
		if v == s {
			return true
		}
	}
	return false
}

func isValidCasePriority(s string) bool {
	for _, v := range validCasePriorities {
		if v == s {
			return true
		}
	}
	return false
}

// findCaseByID must be called with mu held.
func findCaseByID(id string) (Case, bool) {
	for _, c := range cases {
		if c.ID == id {
			return c, true
		}
	}
	return Case{}, false
}

// validateCase must be called with mu held.
func validateCase(req caseRequest) map[string]string {
	fields := map[string]string{}

	clientID := strings.TrimSpace(req.ClientID)
	service := strings.TrimSpace(req.ServiceCategory)
	stage := strings.TrimSpace(req.CurrentStage)
	priority := strings.TrimSpace(req.Priority)

	if clientID == "" {
		fields["clientId"] = "Client is required"
	} else if _, ok := findContactByID(clientID); !ok {
		fields["clientId"] = "Client not found"
	}

	if service == "" {
		fields["serviceCategory"] = "Service category is required"
	}

	if stage == "" {
		fields["currentStage"] = "Stage is required"
	} else if !isValidCaseStage(stage) {
		fields["currentStage"] = "Invalid stage"
	}

	if priority == "" {
		fields["priority"] = "Priority is required"
	} else if !isValidCasePriority(priority) {
		fields["priority"] = "Invalid priority"
	}

	return fields
}

func listCasesHandler(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	stage := strings.TrimSpace(r.URL.Query().Get("stage"))
	clientID := strings.TrimSpace(r.URL.Query().Get("clientId"))
	limit, offset := parseLimitOffset(r, 50, 0)

	all := listCases()
	filtered := make([]Case, 0, len(all))
	for _, c := range all {
		if stage != "" && c.CurrentStage != stage {
			continue
		}
		if clientID != "" && c.ClientID != clientID {
			continue
		}
		if q == "" ||
			strings.Contains(strings.ToLower(c.CaseNumber), q) ||
			strings.Contains(strings.ToLower(c.ClientName), q) ||
			strings.Contains(strings.ToLower(c.ServiceCategory), q) ||
			strings.Contains(strings.ToLower(c.DestinationCountry), q) ||
			strings.Contains(strings.ToLower(c.AssignedOfficer), q) {
			filtered = append(filtered, c)
		}
	}
	total := len(filtered)
	writeJSON(w, http.StatusOK, map[string]any{
		"cases":  slicePage(filtered, offset, limit),
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

func getCaseHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	mu.RLock()
	defer mu.RUnlock()
	for _, c := range cases {
		if c.ID == id {
			writeJSON(w, http.StatusOK, map[string]any{"case": c})
			return
		}
	}
	writeError(w, http.StatusNotFound, "Case not found")
}

func createCaseHandler(w http.ResponseWriter, r *http.Request) {
	var req caseRequest
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

	if fields := validateCase(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	clientID := strings.TrimSpace(req.ClientID)
	clientName := ""
	if c, ok := findContactByID(clientID); ok {
		clientName = c.Name
	}

	now := time.Now().Format("2006-01-02")
	caseNumber := strings.TrimSpace(req.CaseNumber)
	if caseNumber == "" {
		caseNumber = fmt.Sprintf("ECC-CASE-%d-%05d",
			time.Now().Year(), time.Now().UnixNano()%100000)
	}

	newCase := Case{
		ID:                 newID("case"),
		CaseNumber:         caseNumber,
		ClientID:           clientID,
		ClientName:         clientName,
		ServiceCategory:    strings.TrimSpace(req.ServiceCategory),
		DestinationCountry: strings.TrimSpace(strings.ToUpper(req.DestinationCountry)),
		VisaType:           strings.TrimSpace(req.VisaType),
		SchoolOrEmployer:   strings.TrimSpace(req.SchoolOrEmployer),
		AssignedOfficer:    strings.TrimSpace(req.AssignedOfficer),
		ExternalAdviser:    strings.TrimSpace(req.ExternalAdviser),
		DateOpened:         normalizeDate(req.DateOpened),
		TargetSubmission:   strings.TrimSpace(req.TargetSubmission),
		ActualSubmission:   strings.TrimSpace(req.ActualSubmission),
		GovernmentRef:      strings.TrimSpace(req.GovernmentRef),
		CurrentStage:       strings.TrimSpace(req.CurrentStage),
		Priority:           strings.TrimSpace(req.Priority),
		NextAction:         strings.TrimSpace(req.NextAction),
		NextDeadline:       strings.TrimSpace(req.NextDeadline),
		Result:             strings.TrimSpace(req.Result),
		ClosureDate:        strings.TrimSpace(req.ClosureDate),
		Notes:              req.Notes,
		CreatedBy:          createdBy,
		CreatedAt:          now,
	}

	cases = append(cases, newCase)
	writeJSON(w, http.StatusCreated, map[string]any{"case": newCase})
}

func updateCaseHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req caseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, c := range cases {
		if c.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Case not found")
		return
	}

	if fields := validateCase(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	clientID := strings.TrimSpace(req.ClientID)
	clientName := ""
	if c, ok := findContactByID(clientID); ok {
		clientName = c.Name
	}

	updated := cases[idx]
	updated.CaseNumber = strings.TrimSpace(req.CaseNumber)
	updated.ClientID = clientID
	updated.ClientName = clientName
	updated.ServiceCategory = strings.TrimSpace(req.ServiceCategory)
	updated.DestinationCountry = strings.TrimSpace(strings.ToUpper(req.DestinationCountry))
	updated.VisaType = strings.TrimSpace(req.VisaType)
	updated.SchoolOrEmployer = strings.TrimSpace(req.SchoolOrEmployer)
	updated.AssignedOfficer = strings.TrimSpace(req.AssignedOfficer)
	updated.ExternalAdviser = strings.TrimSpace(req.ExternalAdviser)
	updated.DateOpened = strings.TrimSpace(req.DateOpened)
	updated.TargetSubmission = strings.TrimSpace(req.TargetSubmission)
	updated.ActualSubmission = strings.TrimSpace(req.ActualSubmission)
	updated.GovernmentRef = strings.TrimSpace(req.GovernmentRef)
	updated.CurrentStage = strings.TrimSpace(req.CurrentStage)
	updated.Priority = strings.TrimSpace(req.Priority)
	updated.NextAction = strings.TrimSpace(req.NextAction)
	updated.NextDeadline = strings.TrimSpace(req.NextDeadline)
	updated.Result = strings.TrimSpace(req.Result)
	updated.ClosureDate = strings.TrimSpace(req.ClosureDate)
	updated.Notes = req.Notes

	cases[idx] = updated
	writeJSON(w, http.StatusOK, map[string]any{"case": updated})
}

func updateCaseStageHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req caseStageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, c := range cases {
		if c.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Case not found")
		return
	}

	stage := strings.TrimSpace(req.CurrentStage)
	if !isValidCaseStage(stage) {
		writeFieldErrors(w, map[string]string{"currentStage": "Invalid stage"})
		return
	}

	cases[idx].CurrentStage = stage
	writeJSON(w, http.StatusOK, map[string]any{"case": cases[idx]})
}

func deleteCaseHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, c := range cases {
		if c.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Case not found")
		return
	}

	cases = append(cases[:idx], cases[idx+1:]...)

	keptDocs := documents[:0]
	for _, d := range documents {
		if d.CaseID != id {
			keptDocs = append(keptDocs, d)
		}
	}
	documents = keptDocs

	writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}
