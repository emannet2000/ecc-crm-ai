package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	initSecret()
	seedData()

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/login", handleLogin)
	mux.HandleFunc("POST /api/register", handleRegister)
	mux.HandleFunc("GET /api/me", authMiddleware(handleMe))

	mux.HandleFunc("GET /api/contacts", authMiddleware(listContacts))
	mux.HandleFunc("POST /api/contacts", authMiddleware(createContact))
	mux.HandleFunc("GET /api/contacts/{id}", authMiddleware(getContact))
	mux.HandleFunc("PUT /api/contacts/{id}", authMiddleware(updateContact))
	mux.HandleFunc("DELETE /api/contacts/{id}", authMiddleware(deleteContact))

	mux.HandleFunc("GET /api/contacts/{id}/activities", authMiddleware(listActivities))
	mux.HandleFunc("POST /api/contacts/{id}/activities", authMiddleware(createActivity))
	mux.HandleFunc("DELETE /api/activities/{id}", authMiddleware(deleteActivity))

	mux.HandleFunc("GET /api/deals", authMiddleware(listDeals))
	mux.HandleFunc("POST /api/deals", authMiddleware(createDeal))
	mux.HandleFunc("GET /api/deals/{id}", authMiddleware(getDeal))
	mux.HandleFunc("PUT /api/deals/{id}", authMiddleware(updateDeal))
	mux.HandleFunc("PATCH /api/deals/{id}/stage", authMiddleware(updateDealStage))
	mux.HandleFunc("DELETE /api/deals/{id}", authMiddleware(deleteDeal))

	mux.HandleFunc("GET /api/tasks", authMiddleware(listTasks))
	mux.HandleFunc("POST /api/tasks", authMiddleware(createTask))
	mux.HandleFunc("GET /api/tasks/{id}", authMiddleware(getTask))
	mux.HandleFunc("PUT /api/tasks/{id}", authMiddleware(updateTask))
	mux.HandleFunc("PATCH /api/tasks/{id}/status", authMiddleware(updateTaskStatus))
	mux.HandleFunc("DELETE /api/tasks/{id}", authMiddleware(deleteTask))

	// Serve project root (parent of server-go) so /public and elm.js resolve.
	root, _ := filepath.Abs("..")
	mux.Handle("/", http.FileServer(http.Dir(root)))

	addr := ":" + port
	fmt.Printf("Go server listening on http://localhost%s\n", addr)
	fmt.Printf("Serving static files from: %s\n", root)
	log.Fatal(http.ListenAndServe(addr, mux))
}
