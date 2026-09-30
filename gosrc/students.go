package main

import (
	"log"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type studentRequest struct {
	Name             string `json:"name"`
	StudentCode      string `json:"studentCode"`
	CountryCode      string `json:"countryCode"`
	SchoolID         string `json:"schoolId"`
	AgentID          string `json:"agentId"`
	Program          string `json:"program"`
	AcceptanceStatus string `json:"acceptanceStatus"`
	VisaStatus       string `json:"visaStatus"`
	InvoiceStatus    string `json:"invoiceStatus"`
	Notes            string `json:"notes"`
}

var validAcceptanceStatuses = []string{"Pending", "Accepted", "Rejected", "Waitlisted"}
var validVisaStatuses = []string{"Not Started", "Pending", "Approved", "Denied"}
var validInvoiceStatuses = []string{"Not Issued", "Issued", "Paid", "Overdue"}

func isValidAcceptanceStatus(s string) bool {
	for _, v := range validAcceptanceStatuses {
		if v == s {
			return true
		}
	}
	return false
}

func isValidVisaStatus(s string) bool {
	for _, v := range validVisaStatuses {
		if v == s {
			return true
		}
	}
	return false
}

func isValidInvoiceStatus(s string) bool {
	for _, v := range validInvoiceStatuses {
		if v == s {
			return true
		}
	}
	return false
}

func validateStudent(req studentRequest) map[string]string {
	fields := map[string]string{}

	name := strings.TrimSpace(req.Name)
	acceptance := strings.TrimSpace(req.AcceptanceStatus)
	visa := strings.TrimSpace(req.VisaStatus)
	invoice := strings.TrimSpace(req.InvoiceStatus)
	schoolID := strings.TrimSpace(req.SchoolID)
	agentID := strings.TrimSpace(req.AgentID)

	if name == "" {
		fields["name"] = "Student name is required"
	} else if len(name) > 200 {
		fields["name"] = "Name must be 200 characters or fewer"
	}

	if acceptance == "" {
		fields["acceptanceStatus"] = "Acceptance status is required"
	} else if !isValidAcceptanceStatus(acceptance) {
		fields["acceptanceStatus"] = "Invalid acceptance status"
	}

	if visa == "" {
		fields["visaStatus"] = "Visa status is required"
	} else if !isValidVisaStatus(visa) {
		fields["visaStatus"] = "Invalid visa status"
	}

	if invoice == "" {
		fields["invoiceStatus"] = "Invoice status is required"
	} else if !isValidInvoiceStatus(invoice) {
		fields["invoiceStatus"] = "Invalid invoice status"
	}

	if schoolID != "" {
		if _, ok := getSchoolByID(schoolID); !ok {
			fields["schoolId"] = "School not found"
		}
	}

	if agentID != "" {
		if _, ok := getAgentByID(agentID); !ok {
			fields["agentId"] = "Agent not found"
		}
	}

	return fields
}

func listStudentsHandler(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	limit, offset := parseLimitOffset(r, 50, 0)

	all := listStudents()
	filtered := make([]Student, 0, len(all))
	for _, s := range all {
		if q == "" ||
			strings.Contains(strings.ToLower(s.Name), q) ||
			strings.Contains(strings.ToLower(s.StudentCode), q) ||
			strings.Contains(strings.ToLower(s.SchoolName), q) ||
			strings.Contains(strings.ToLower(s.AgentName), q) ||
			strings.Contains(strings.ToLower(s.Program), q) {
			filtered = append(filtered, s)
		}
	}
	total := len(filtered)
	writeJSON(w, http.StatusOK, map[string]any{
		"students": slicePage(filtered, offset, limit),
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}

func getStudentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	s, ok := getStudentByID(id)
	if !ok {
		writeError(w, http.StatusNotFound, "Student not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"student": s})
}

// studentDossierHandler returns the student plus every case, document, and
// invoice tied to them. This is what the admin student-detail page renders
// and what the (future) student portal will consume.
func studentDossierHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.RLock()
	defer mu.RUnlock()

	student, ok := findStudentByID(id)
	if !ok {
		writeError(w, http.StatusNotFound, "Student not found")
		return
	}

	studentCases := make([]Case, 0)
	caseIDs := map[string]bool{}
	for _, c := range cases {
		if c.StudentID == id {
			studentCases = append(studentCases, c)
			caseIDs[c.ID] = true
		}
	}

	studentDocs := make([]Document, 0)
	for _, d := range documents {
		if caseIDs[d.CaseID] {
			studentDocs = append(studentDocs, d)
		}
	}

	studentInvoices := make([]Invoice, 0)
	for _, inv := range invoices {
		if caseIDs[inv.CaseID] {
			studentInvoices = append(studentInvoices, inv)
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"student":   student,
		"cases":     studentCases,
		"documents": studentDocs,
		"invoices":  studentInvoices,
	})
}

func createStudentHandler(w http.ResponseWriter, r *http.Request) {
	var req studentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if fields := validateStudent(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	email, _ := r.Context().Value(ctxUserEmail).(string)
	createdBy := "Unknown"
	if email != "" {
		if u, ok := findUserByEmail(email); ok {
			createdBy = u.Name
		}
	}

	schoolID := strings.TrimSpace(req.SchoolID)
	schoolName := ""
	if schoolID != "" {
		if sch, ok := getSchoolByID(schoolID); ok {
			schoolName = sch.Name
		}
	}

	agentID := strings.TrimSpace(req.AgentID)
	agentName := ""
	if agentID != "" {
		if a, ok := getAgentByID(agentID); ok {
			agentName = a.Name
		}
	}

	now := time.Now().Format("2006-01-02")
	newStudent := Student{
		ID:               newID("st"),
		Name:             strings.TrimSpace(req.Name),
		StudentCode:      strings.TrimSpace(req.StudentCode),
		CountryCode:      strings.TrimSpace(strings.ToUpper(req.CountryCode)),
		SchoolID:         schoolID,
		SchoolName:       schoolName,
		AgentID:          agentID,
		AgentName:        agentName,
		Program:          strings.TrimSpace(req.Program),
		AcceptanceStatus: strings.TrimSpace(req.AcceptanceStatus),
		VisaStatus:       strings.TrimSpace(req.VisaStatus),
		InvoiceStatus:    strings.TrimSpace(req.InvoiceStatus),
		Notes:            req.Notes,
		CreatedBy:        createdBy,
		CreatedAt:        now,
	}

	mu.Lock()
	students = append(students, newStudent)
	mu.Unlock()

	writeJSON(w, http.StatusCreated, map[string]any{"student": newStudent})
}

func updateStudentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req studentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if fields := validateStudent(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	schoolID := strings.TrimSpace(req.SchoolID)
	schoolName := ""
	if schoolID != "" {
		if sch, ok := getSchoolByID(schoolID); ok {
			schoolName = sch.Name
		}
	}

	agentID := strings.TrimSpace(req.AgentID)
	agentName := ""
	if agentID != "" {
		if a, ok := getAgentByID(agentID); ok {
			agentName = a.Name
		}
	}

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, s := range students {
		if s.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Student not found")
		return
	}

	updated := students[idx]
	updated.Name = strings.TrimSpace(req.Name)
	updated.StudentCode = strings.TrimSpace(req.StudentCode)
	updated.CountryCode = strings.TrimSpace(strings.ToUpper(req.CountryCode))
	updated.SchoolID = schoolID
	updated.SchoolName = schoolName
	updated.AgentID = agentID
	updated.AgentName = agentName
	updated.Program = strings.TrimSpace(req.Program)
	updated.AcceptanceStatus = strings.TrimSpace(req.AcceptanceStatus)
	updated.VisaStatus = strings.TrimSpace(req.VisaStatus)
	updated.InvoiceStatus = strings.TrimSpace(req.InvoiceStatus)
	updated.Notes = req.Notes

	students[idx] = updated
	writeJSON(w, http.StatusOK, map[string]any{"student": updated})
}

func deleteStudentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, s := range students {
		if s.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Student not found")
		return
	}

	students = append(students[:idx], students[idx+1:]...)

	// Orphan any cases that were linked to this student.
	for i := range cases {
		if cases[i].StudentID == id {
			cases[i].StudentID = ""
			cases[i].StudentName = ""
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}


// ---- seed data & in-memory accessors (moved from store.go) ----

func seedStudents() {
	students = []Student{
		{
			ID: "st_1", Name: "Maria Santos", StudentCode: "ECC-PH-2026-00001",
			CountryCode: "PH", SchoolID: "s_1", SchoolName: "University of Toronto",
			AgentID: "ag_1", AgentName: "Ravi Kumar",
			Program: "MSc Computer Science", AcceptanceStatus: "Accepted",
			VisaStatus: "Pending", InvoiceStatus: "Issued",
			Notes:     "Strong candidate. Visa appointment scheduled for October.",
			CreatedBy: "Demo User", CreatedAt: "2026-06-12",
		},
		{
			ID: "st_2", Name: "John Okonkwo", StudentCode: "ECC-NG-2026-00002",
			CountryCode: "NG", SchoolID: "s_2", SchoolName: "University of Melbourne",
			AgentID: "ag_2", AgentName: "Fatima Al-Zahra",
			Program: "MBA", AcceptanceStatus: "Accepted",
			VisaStatus: "Approved", InvoiceStatus: "Paid",
			Notes:     "Visa approved. Enrolled for the February intake.",
			CreatedBy: "Demo User", CreatedAt: "2026-04-03",
		},
		{
			ID: "st_3", Name: "Priya Sharma", StudentCode: "ECC-IN-2026-00003",
			CountryCode: "IN", SchoolID: "s_1", SchoolName: "University of Toronto",
			AgentID: "ag_1", AgentName: "Ravi Kumar",
			Program: "BSc Data Science", AcceptanceStatus: "Waitlisted",
			VisaStatus: "Not Started", InvoiceStatus: "Not Issued",
			Notes:     "On waitlist — awaiting university decision.",
			CreatedBy: "Demo User", CreatedAt: "2026-08-20",
		},
		{
			ID: "st_4", Name: "Ahmed Hassan", StudentCode: "ECC-EG-2026-00004",
			CountryCode: "EG", SchoolID: "s_3", SchoolName: "Auckland Institute of Studies",
			AgentID: "", AgentName: "",
			Program: "Diploma in IT", AcceptanceStatus: "Pending",
			VisaStatus: "Not Started", InvoiceStatus: "Not Issued",
			Notes:     "Application submitted. Awaiting school response.",
			CreatedBy: "Demo User", CreatedAt: "2026-09-01",
		},
	}
	log.Println("Seeded 4 students")
}

func listStudents() []Student {
	mu.RLock()
	defer mu.RUnlock()
	out := make([]Student, len(students))
	copy(out, students)
	return out
}

func getStudentByID(id string) (Student, bool) {
	mu.RLock()
	defer mu.RUnlock()
	for _, s := range students {
		if s.ID == id {
			return s, true
		}
	}
	return Student{}, false
}

// ================= AGENTS: ACCESSORS =================
