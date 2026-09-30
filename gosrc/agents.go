package main

import (
	"log"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type agentRequest struct {
	Name             string `json:"name"`
	AgentCode        string `json:"agentCode"`
	CountryCode      string `json:"countryCode"`
	ContractStatus   string `json:"contractStatus"`
	AgentStatus      string `json:"agentStatus"`
	StudentsReferred int    `json:"studentsReferred"`
	Notes            string `json:"notes"`
}

var validAgentContractStatuses = []string{"Signed", "Not Signed", "Pending"}
var validAgentStatuses = []string{"Active", "Inactive"}

func isValidAgentContractStatus(s string) bool {
	for _, v := range validAgentContractStatuses {
		if v == s {
			return true
		}
	}
	return false
}

func isValidAgentStatus(s string) bool {
	for _, v := range validAgentStatuses {
		if v == s {
			return true
		}
	}
	return false
}

func validateAgent(req agentRequest) map[string]string {
	fields := map[string]string{}

	name := strings.TrimSpace(req.Name)
	contract := strings.TrimSpace(req.ContractStatus)
	status := strings.TrimSpace(req.AgentStatus)

	if name == "" {
		fields["name"] = "Agent name is required"
	} else if len(name) > 200 {
		fields["name"] = "Name must be 200 characters or fewer"
	}

	if contract == "" {
		fields["contractStatus"] = "Contract status is required"
	} else if !isValidAgentContractStatus(contract) {
		fields["contractStatus"] = "Invalid contract status"
	}

	if status == "" {
		fields["agentStatus"] = "Agent status is required"
	} else if !isValidAgentStatus(status) {
		fields["agentStatus"] = "Invalid agent status"
	}

	if req.StudentsReferred < 0 {
		fields["studentsReferred"] = "Student count can't be negative"
	}

	return fields
}

func listAgentsHandler(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	limit, offset := parseLimitOffset(r, 50, 0)

	all := listAgents()
	filtered := make([]Agent, 0, len(all))
	for _, a := range all {
		if q == "" ||
			strings.Contains(strings.ToLower(a.Name), q) ||
			strings.Contains(strings.ToLower(a.AgentCode), q) ||
			strings.Contains(strings.ToLower(a.CountryCode), q) {
			filtered = append(filtered, a)
		}
	}
	total := len(filtered)
	writeJSON(w, http.StatusOK, map[string]any{
		"agents": slicePage(filtered, offset, limit),
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

func getAgentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	a, ok := getAgentByID(id)
	if !ok {
		writeError(w, http.StatusNotFound, "Agent not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"agent": a})
}

func createAgentHandler(w http.ResponseWriter, r *http.Request) {
	var req agentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if fields := validateAgent(req); len(fields) > 0 {
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

	now := time.Now().Format("2006-01-02")
	newAgent := Agent{
		ID:               newID("ag"),
		Name:             strings.TrimSpace(req.Name),
		AgentCode:        strings.TrimSpace(req.AgentCode),
		CountryCode:      strings.TrimSpace(strings.ToUpper(req.CountryCode)),
		ContractStatus:   strings.TrimSpace(req.ContractStatus),
		AgentStatus:      strings.TrimSpace(req.AgentStatus),
		StudentsReferred: req.StudentsReferred,
		Notes:            req.Notes,
		CreatedBy:        createdBy,
		CreatedAt:        now,
	}

	mu.Lock()
	agents = append(agents, newAgent)
	mu.Unlock()

	writeJSON(w, http.StatusCreated, map[string]any{"agent": newAgent})
}

func updateAgentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req agentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if fields := validateAgent(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, a := range agents {
		if a.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Agent not found")
		return
	}

	updated := agents[idx]
	updated.Name = strings.TrimSpace(req.Name)
	updated.AgentCode = strings.TrimSpace(req.AgentCode)
	updated.CountryCode = strings.TrimSpace(strings.ToUpper(req.CountryCode))
	updated.ContractStatus = strings.TrimSpace(req.ContractStatus)
	updated.AgentStatus = strings.TrimSpace(req.AgentStatus)
	updated.StudentsReferred = req.StudentsReferred
	updated.Notes = req.Notes

	agents[idx] = updated
	writeJSON(w, http.StatusOK, map[string]any{"agent": updated})
}

func deleteAgentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, a := range agents {
		if a.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Agent not found")
		return
	}

	agents = append(agents[:idx], agents[idx+1:]...)

	for i := range students {
		if students[i].AgentID == id {
			students[i].AgentID = ""
			students[i].AgentName = ""
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}


// ---- seed data & in-memory accessors (moved from store.go) ----

func seedAgents() {
	agents = []Agent{
		{
			ID: "ag_1", Name: "Ravi Kumar", AgentCode: "ECC-AG-00001",
			CountryCode: "IN", ContractStatus: "Signed", AgentStatus: "Active",
			StudentsReferred: 14,
			Notes:            "Top performer for Canada and Australia intakes.",
			CreatedBy:        "Demo User", CreatedAt: "2025-08-14",
		},
		{
			ID: "ag_2", Name: "Fatima Al-Zahra", AgentCode: "ECC-AG-00002",
			CountryCode: "AE", ContractStatus: "Signed", AgentStatus: "Active",
			StudentsReferred: 9,
			Notes:            "Strong in UAE and Gulf referrals.",
			CreatedBy:        "Demo User", CreatedAt: "2025-11-20",
		},
		{
			ID: "ag_3", Name: "Chen Wei", AgentCode: "ECC-AG-00003",
			CountryCode: "CN", ContractStatus: "Pending", AgentStatus: "Inactive",
			StudentsReferred: 0,
			Notes:            "Contract under negotiation. Not yet active.",
			CreatedBy:        "Demo User", CreatedAt: "2026-07-03",
		},
		{
			ID: "ag_4", Name: "Sofia Martinez", AgentCode: "ECC-AG-00004",
			CountryCode: "PH", ContractStatus: "Not Signed", AgentStatus: "Inactive",
			StudentsReferred: 0,
			Notes:            "Initial contact. Awaiting response.",
			CreatedBy:        "Demo User", CreatedAt: "2026-09-01",
		},
	}
	log.Println("Seeded 4 agents")
}

func listAgents() []Agent {
	mu.RLock()
	defer mu.RUnlock()
	out := make([]Agent, len(agents))
	copy(out, agents)
	return out
}

func getAgentByID(id string) (Agent, bool) {
	mu.RLock()
	defer mu.RUnlock()
	for _, a := range agents {
		if a.ID == id {
			return a, true
		}
	}
	return Agent{}, false
}

// ================= LEADS: ACCESSORS =================
