package main

import (
	"log"
	"net/http"
)

func main() {
	store := NewStore()
	Seed(store)
	sessions := NewSessionStore()

	h := &Handlers{store: store, sessions: sessions}

	mux := http.NewServeMux()

	// ---------- auth ----------
	mux.HandleFunc("POST /api/auth/login", h.Login)
	mux.HandleFunc("GET /api/auth/me", h.Auth(h.Me))
	mux.HandleFunc("PUT /api/auth/password", h.Auth(h.ChangePassword))

	// ---------- users ----------
	mux.HandleFunc("GET /api/users", h.Auth(h.ListUsers))
	mux.HandleFunc("POST /api/users", h.Auth(h.CreateUser))
	mux.HandleFunc("PATCH /api/users/{id}", h.Auth(h.UpdateUser))
	mux.HandleFunc("DELETE /api/users/{id}", h.Auth(h.DeleteUser))

	// ---------- leads ----------
	mux.HandleFunc("GET /api/leads", h.Auth(h.ListLeads))
	mux.HandleFunc("POST /api/leads", h.Auth(h.CreateLead))
	mux.HandleFunc("GET /api/leads/{id}", h.Auth(h.GetLeadDetail))
	mux.HandleFunc("PATCH /api/leads/{id}", h.Auth(h.UpdateLead))
	mux.HandleFunc("DELETE /api/leads/{id}", h.Auth(h.DeleteLead))
	mux.HandleFunc("POST /api/leads/{id}/advance", h.Auth(h.AdvanceLead))
	mux.HandleFunc("POST /api/leads/{id}/convert", h.Auth(h.ConvertLead))
	mux.HandleFunc("POST /api/leads/{id}/notes", h.Auth(h.AddNote))
	mux.HandleFunc("POST /api/bulk/leads", h.Auth(h.BulkLeads))

	// ---------- tasks ----------
	mux.HandleFunc("GET /api/tasks", h.Auth(h.ListTasks))
	mux.HandleFunc("POST /api/tasks", h.Auth(h.CreateTask))
	mux.HandleFunc("PATCH /api/tasks/{id}", h.Auth(h.UpdateTaskStatus))
	mux.HandleFunc("DELETE /api/tasks/{id}", h.Auth(h.DeleteTask))

	// ---------- clients / cases ----------
	mux.HandleFunc("GET /api/clients", h.Auth(h.ListClients))
	mux.HandleFunc("POST /api/clients", h.Auth(h.CreateClient))
	mux.HandleFunc("GET /api/clients/{id}", h.Auth(h.GetClientDetail))
	mux.HandleFunc("PATCH /api/clients/{id}", h.Auth(h.UpdateClient))
	mux.HandleFunc("DELETE /api/clients/{id}", h.Auth(h.DeleteClient))
	mux.HandleFunc("POST /api/clients/{id}/cases", h.Auth(h.UpsertCase))
	mux.HandleFunc("DELETE /api/cases/{id}", h.Auth(h.DeleteCase))

	// ---------- stats / audit ----------
	mux.HandleFunc("GET /api/stats", h.Auth(h.Stats))
	mux.HandleFunc("GET /api/audit", h.Auth(h.Audit))

	handler := withCORS(mux)

	log.Println("ECC CRM backend on :4000")
	log.Fatal(http.ListenAndServe(":4000", handler))
}

// withCORS allows the Elm dev server (reactor / browser on another port) to reach us.
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
