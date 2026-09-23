package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"-"`
}

type Contact struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Email       string   `json:"email"`
	Company     string   `json:"company"`
	Title       string   `json:"title"`
	Phone       string   `json:"phone"`
	Location    string   `json:"location"`
	Stage       string   `json:"stage"`
	LastContact string   `json:"lastContact"`
	Owner       string   `json:"owner"`
	Tags        []string `json:"tags"`
	Notes       string   `json:"notes"`
	CreatedAt   string   `json:"createdAt"`
}

type Deal struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	ContactID   string  `json:"contactId"`
	ContactName string  `json:"contactName"`
	Value       float64 `json:"value"`
	Stage       string  `json:"stage"`
	CloseDate   string  `json:"closeDate"`
	Owner       string  `json:"owner"`
	Notes       string  `json:"notes"`
	CreatedAt   string  `json:"createdAt"`
}

type Activity struct {
	ID         string `json:"id"`
	ContactID  string `json:"contactId"`
	DealID     string `json:"dealId"`
	Kind       string `json:"kind"`
	Title      string `json:"title"`
	Body       string `json:"body"`
	OccurredAt string `json:"occurredAt"`
	CreatedBy  string `json:"createdBy"`
	CreatedAt  string `json:"createdAt"`
}

type Task struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	DueDate     string `json:"dueDate"`
	ContactID   string `json:"contactId"`
	ContactName string `json:"contactName"`
	Owner       string `json:"owner"`
	CreatedAt   string `json:"createdAt"`
}

var (
	mu         sync.RWMutex
	users      = map[string]User{}
	contacts   = []Contact{}
	deals      = []Deal{}
	activities = []Activity{}
	tasks      = []Task{}
)

func newID(prefix string) string {
	return fmt.Sprintf("%s_%d", prefix, time.Now().UnixNano())
}

func parseLimitOffset(r *http.Request, defaultLimit, defaultOffset int) (limit, offset int) {
	limit, offset = defaultLimit, defaultOffset
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			limit = n
		}
	}
	if limit > 200 {
		limit = 200
	}
	if v := r.URL.Query().Get("offset"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			offset = n
		}
	}
	return
}

func slicePage[T any](items []T, offset, limit int) []T {
	if offset >= len(items) {
		return []T{}
	}
	end := offset + limit
	if end > len(items) {
		end = len(items)
	}
	return items[offset:end]
}

func seedData() {
	hash, _ := bcrypt.GenerateFromPassword([]byte("Demo1234"), bcrypt.DefaultCost)
	users["demo@northwind.dev"] = User{
		ID:       "u_1",
		Name:     "Demo User",
		Email:    "demo@northwind.dev",
		Password: string(hash),
	}
	log.Println("Seeded demo user: demo@northwind.dev / Demo1234")

	contacts = []Contact{
		{
			ID: "c_1", Name: "Ada Lovelace", Email: "ada@analytical.io",
			Company: "Analytical Engines", Title: "Chief Scientist",
			Phone: "+44 20 7946 0958", Location: "London, UK",
			Stage: "Customer", LastContact: "2026-09-08", Owner: "Demo User",
			Tags: []string{"VIP", "Technical", "Q4-target"},
			Notes: "Met at Q3 conference. Decision maker for technical purchases. Interested in the enterprise tier with SSO and audit logs.",
			CreatedAt: "2026-01-15",
		},
		{
			ID: "c_2", Name: "Grace Hopper", Email: "grace@navy.mil",
			Company: "US Navy", Title: "Rear Admiral",
			Phone: "+1 202 555 0142", Location: "Washington, DC",
			Stage: "Customer", LastContact: "2026-09-05", Owner: "Demo User",
			Tags: []string{"VIP", "Government"},
			Notes: "Long-time customer. Renewed for 3 years.",
			CreatedAt: "2025-06-02",
		},
		{
			ID: "c_3", Name: "Alan Turing", Email: "alan@bletchley.uk",
			Company: "Bletchley Park", Title: "Research Lead",
			Phone: "+44 1908 640404", Location: "Milton Keynes, UK",
			Stage: "Qualified", LastContact: "2026-09-01", Owner: "Demo User",
			Tags: []string{"Technical", "Research"},
			Notes: "Evaluating our cryptography features. Warm lead.",
			CreatedAt: "2026-08-12",
		},
		{
			ID: "c_4", Name: "Katherine Johnson", Email: "kj@nasa.gov",
			Company: "NASA", Title: "Research Mathematician",
			Phone: "+1 281 483 0121", Location: "Houston, TX",
			Stage: "Proposal", LastContact: "2026-08-28", Owner: "Demo User",
			Tags: []string{"Aerospace", "Q4-target"},
			Notes: "Proposal v2 sent. Waiting on procurement review.",
			CreatedAt: "2026-07-01",
		},
		{
			ID: "c_5", Name: "Linus Torvalds", Email: "linus@kernel.org",
			Company: "Linux Foundation", Title: "Principal Engineer",
			Phone: "+1 415 555 0198", Location: "Portland, OR",
			Stage: "Lead", LastContact: "2026-08-22", Owner: "Demo User",
			Tags: []string{"Open Source"},
			Notes: "Inbound from conference talk. Not yet qualified.",
			CreatedAt: "2026-08-22",
		},
		{
			ID: "c_6", Name: "Margaret Hamilton", Email: "mh@mit.edu",
			Company: "MIT", Title: "Professor",
			Phone: "+1 617 253 1000", Location: "Cambridge, MA",
			Stage: "Customer", LastContact: "2026-09-09", Owner: "Demo User",
			Tags: []string{"Academic", "VIP"},
			Notes: "Champion for the department-wide rollout.",
			CreatedAt: "2025-11-20",
		},
		{
			ID: "c_7", Name: "Donald Knuth", Email: "knuth@stanford.edu",
			Company: "Stanford", Title: "Professor Emeritus",
			Phone: "+1 650 723 2300", Location: "Stanford, CA",
			Stage: "Qualified", LastContact: "2026-08-30", Owner: "Demo User",
			Tags: []string{"Academic"},
			Notes: "",
			CreatedAt: "2026-08-25",
		},
		{
			ID: "c_8", Name: "Barbara Liskov", Email: "liskov@mit.edu",
			Company: "MIT", Title: "Institute Professor",
			Phone: "+1 617 253 1000", Location: "Cambridge, MA",
			Stage: "Proposal", LastContact: "2026-08-25", Owner: "Demo User",
			Tags: []string{"Academic", "Technical"},
			Notes: "Interested in the API integrations story.",
			CreatedAt: "2026-06-14",
		},
	}
	log.Println("Seeded 8 contacts")

	seedDeals()
	seedActivities()
	seedTasks()
}

func seedDeals() {
	deals = []Deal{
		{
			ID: "d_1", Title: "Analytical Engines — Enterprise tier", ContactID: "c_1", ContactName: "Ada Lovelace",
			Value: 48000, Stage: "Negotiation", CloseDate: "2026-10-15", Owner: "Demo User",
			Notes: "SSO and audit logs are the blockers. Legal reviewing redlines.",
			CreatedAt: "2026-08-01",
		},
		{
			ID: "d_2", Title: "US Navy — 3yr renewal", ContactID: "c_2", ContactName: "Grace Hopper",
			Value: 96000, Stage: "Won", CloseDate: "2026-06-02", Owner: "Demo User",
			Notes: "Renewed for 3 years.",
			CreatedAt: "2025-05-01",
		},
		{
			ID: "d_3", Title: "Bletchley Park — Cryptography add-on", ContactID: "c_3", ContactName: "Alan Turing",
			Value: 22000, Stage: "Qualified", CloseDate: "2026-11-01", Owner: "Demo User",
			Notes: "Warm lead, evaluating cryptography features.",
			CreatedAt: "2026-08-12",
		},
		{
			ID: "d_4", Title: "NASA — Research suite", ContactID: "c_4", ContactName: "Katherine Johnson",
			Value: 61000, Stage: "Proposal", CloseDate: "2026-11-20", Owner: "Demo User",
			Notes: "Proposal v2 sent. Waiting on procurement review.",
			CreatedAt: "2026-07-01",
		},
		{
			ID: "d_5", Title: "Linux Foundation — Trial", ContactID: "c_5", ContactName: "Linus Torvalds",
			Value: 8000, Stage: "Lead", CloseDate: "2026-12-01", Owner: "Demo User",
			Notes: "Inbound from conference talk. Not yet qualified.",
			CreatedAt: "2026-08-22",
		},
		{
			ID: "d_6", Title: "MIT — Department rollout", ContactID: "c_6", ContactName: "Margaret Hamilton",
			Value: 120000, Stage: "Won", CloseDate: "2026-09-09", Owner: "Demo User",
			Notes: "Champion for the department-wide rollout.",
			CreatedAt: "2025-11-20",
		},
		{
			ID: "d_7", Title: "Stanford — Evaluation", ContactID: "c_7", ContactName: "Donald Knuth",
			Value: 15000, Stage: "Lost", CloseDate: "2026-08-30", Owner: "Demo User",
			Notes: "Went with an internal tool instead.",
			CreatedAt: "2026-08-25",
		},
	}
	log.Println("Seeded 7 deals")
}

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

func seedTasks() {
	tasks = []Task{
		{ID: "t_1", Title: "Send revised SSO proposal", Description: "Include audit-log addendum Ada requested.", Status: "todo", DueDate: "2026-09-25", ContactID: "c_1", ContactName: "Ada Lovelace", Owner: "Demo User", CreatedAt: "2026-09-10"},
		{ID: "t_2", Title: "Schedule Navy QBR", Description: "Quarterly business review with Grace's team.", Status: "in_progress", DueDate: "2026-09-20", ContactID: "c_2", ContactName: "Grace Hopper", Owner: "Demo User", CreatedAt: "2026-09-08"},
		{ID: "t_3", Title: "Crypto whitepaper follow-up", Description: "Check if Alan finished the evaluation.", Status: "todo", DueDate: "2026-09-28", ContactID: "c_3", ContactName: "Alan Turing", Owner: "Demo User", CreatedAt: "2026-09-09"},
		{ID: "t_4", Title: "NASA procurement check-in", Description: "Ping legal on proposal v2 status.", Status: "todo", DueDate: "2026-09-18", ContactID: "c_4", ContactName: "Katherine Johnson", Owner: "Demo User", CreatedAt: "2026-09-05"},
		{ID: "t_5", Title: "Close MIT rollout checklist", Description: "Confirm success metrics with department heads.", Status: "done", DueDate: "2026-09-12", ContactID: "c_6", ContactName: "Margaret Hamilton", Owner: "Demo User", CreatedAt: "2026-09-01"},
		{ID: "t_6", Title: "Internal demo for new pipeline view", Description: "Prep slides for Friday all-hands.", Status: "in_progress", DueDate: "2026-09-26", ContactID: "", ContactName: "", Owner: "Demo User", CreatedAt: "2026-09-11"},
	}
	log.Println("Seeded 6 tasks")
}

func findUserByEmail(email string) (User, bool) {
	mu.RLock()
	defer mu.RUnlock()
	u, ok := users[email]
	return u, ok
}
