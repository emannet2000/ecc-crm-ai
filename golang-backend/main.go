package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	initSecret()
	path := os.Getenv("DATABASE_PATH")
	if path == "" {
		path = filepath.Join(findProjectRoot(), "data", "crm.sqlite3")
		if legacy := os.Getenv("DATA_FILE"); legacy != "" {
			os.Setenv("LEGACY_DATA_FILE", legacy)
			path = filepath.Join(filepath.Dir(legacy), "crm.sqlite3")
		}
	}
	if err := loadStore(path); err != nil {
		log.Fatal(err)
	}

	defer database.Close()
	workerContext, cancelWorkers := context.WithCancel(context.Background())
	defer cancelWorkers()
	stopLegacy := startWorkers(workerContext)
	stopExpansion := startExpansionWorkers(workerContext)

	port := os.Getenv("PORT")
	if port == "" {
		port = "7000"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/admin/metrics", authMiddleware(handleMetrics))

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		if err := database.PingContext(r.Context()); err != nil {
			writeError(w, http.StatusServiceUnavailable, "Database unavailable")
			return
		}
		writeJSON(w, 200, statusResponse{Status: "ok"})
	})
	mux.HandleFunc("GET /api/reports", authMiddleware(handleReports))
	mux.HandleFunc("GET /api/search", authMiddleware(handleSearch))
	mux.HandleFunc("GET /api/audit", authMiddleware(handleAudit))
	mux.HandleFunc("GET /api/exports/{entity}", authMiddleware(handleExport))

	// ---- Auth ----
	mux.HandleFunc("POST /api/session/refresh", handleSessionRefresh)
	mux.HandleFunc("POST /api/session/logout", handleSessionLogout)
	mux.HandleFunc("DELETE /api/me/sessions/{session}", authMiddleware(handleRevokeSession))
	mux.HandleFunc("POST /api/me/two-factor", authMiddleware(handleTwoFactor))
	mux.HandleFunc("POST /api/forgot-password", handleForgotPassword)
	mux.HandleFunc("POST /api/reset-password", handleResetPassword)
	registerWorkspaceRoutes(mux)

	mux.HandleFunc("POST /api/login", handleSecureLogin)
	mux.HandleFunc("POST /api/register", handleSecureRegister)
	mux.HandleFunc("GET /api/me", authMiddleware(handleMe))
	mux.HandleFunc("PUT /api/me", authMiddleware(handleUpdateMe))
	mux.HandleFunc("POST /api/me/password", authMiddleware(handleChangePassword))
	mux.HandleFunc("POST /api/me/logout-all", authMiddleware(handleLogoutAll))

	// ---- Contacts ----
	mux.HandleFunc("GET /api/contacts", authMiddleware(listContacts))
	mux.HandleFunc("POST /api/contacts", authMiddleware(createContact))
	mux.HandleFunc("GET /api/contacts/{id}", authMiddleware(getContact))
	mux.HandleFunc("PUT /api/contacts/{id}", authMiddleware(updateContact))
	mux.HandleFunc("DELETE /api/contacts/{id}", authMiddleware(deleteContact))

	// ---- Activities ----
	mux.HandleFunc("GET /api/contacts/{id}/activities", authMiddleware(listActivities))
	mux.HandleFunc("POST /api/contacts/{id}/activities", authMiddleware(createActivity))
	mux.HandleFunc("DELETE /api/activities/{id}", authMiddleware(deleteActivity))

	// ---- Deals ----
	mux.HandleFunc("GET /api/deals", authMiddleware(listDeals))
	mux.HandleFunc("POST /api/deals", authMiddleware(createDeal))
	mux.HandleFunc("GET /api/deals/{id}", authMiddleware(getDeal))
	mux.HandleFunc("PUT /api/deals/{id}", authMiddleware(updateDeal))
	mux.HandleFunc("PATCH /api/deals/{id}/stage", authMiddleware(updateDealStage))
	mux.HandleFunc("DELETE /api/deals/{id}", authMiddleware(deleteDeal))

	// ---- Tasks ----
	mux.HandleFunc("GET /api/tasks", authMiddleware(listTasks))
	mux.HandleFunc("POST /api/tasks", authMiddleware(createTask))
	mux.HandleFunc("GET /api/tasks/{id}", authMiddleware(getTask))
	mux.HandleFunc("PUT /api/tasks/{id}", authMiddleware(updateTask))
	mux.HandleFunc("PATCH /api/tasks/{id}/status", authMiddleware(updateTaskStatus))
	mux.HandleFunc("DELETE /api/tasks/{id}", authMiddleware(deleteTask))

	// ---- Schools ----
	mux.HandleFunc("GET /api/schools", authMiddleware(listSchoolsHandler))
	mux.HandleFunc("POST /api/schools", authMiddleware(createSchoolHandler))
	mux.HandleFunc("GET /api/schools/{id}", authMiddleware(getSchoolHandler))
	mux.HandleFunc("PUT /api/schools/{id}", authMiddleware(updateSchoolHandler))
	mux.HandleFunc("DELETE /api/schools/{id}", authMiddleware(deleteSchoolHandler))

	// ---- Students ----
	mux.HandleFunc("GET /api/students", authMiddleware(listStudentsHandler))
	mux.HandleFunc("POST /api/students", authMiddleware(createStudentHandler))
	mux.HandleFunc("GET /api/students/{id}", authMiddleware(getStudentHandler))
	mux.HandleFunc("PUT /api/students/{id}", authMiddleware(updateStudentHandler))
	mux.HandleFunc("DELETE /api/students/{id}", authMiddleware(deleteStudentHandler))

	// ---- Agents ----
	mux.HandleFunc("GET /api/agents", authMiddleware(listAgentsHandler))
	mux.HandleFunc("POST /api/agents", authMiddleware(createAgentHandler))
	mux.HandleFunc("GET /api/agents/{id}", authMiddleware(getAgentHandler))
	mux.HandleFunc("PUT /api/agents/{id}", authMiddleware(updateAgentHandler))
	mux.HandleFunc("DELETE /api/agents/{id}", authMiddleware(deleteAgentHandler))

	// ---- Leads ----
	mux.HandleFunc("GET /api/leads", authMiddleware(listLeadsHandler))
	mux.HandleFunc("POST /api/leads", authMiddleware(createLeadHandler))
	mux.HandleFunc("GET /api/leads/{id}", authMiddleware(getLeadHandler))
	mux.HandleFunc("PUT /api/leads/{id}", authMiddleware(updateLeadHandler))
	mux.HandleFunc("DELETE /api/leads/{id}", authMiddleware(deleteLeadHandler))

	// ---- Cases ----
	mux.HandleFunc("GET /api/cases", authMiddleware(listCasesHandler))
	mux.HandleFunc("POST /api/cases", authMiddleware(createCaseHandler))
	mux.HandleFunc("GET /api/cases/{id}", authMiddleware(getCaseHandler))
	mux.HandleFunc("PUT /api/cases/{id}", authMiddleware(updateCaseHandler))
	mux.HandleFunc("PATCH /api/cases/{id}/stage", authMiddleware(updateCaseStageHandler))
	mux.HandleFunc("DELETE /api/cases/{id}", authMiddleware(deleteCaseHandler))

	// ---- Documents ----
	mux.HandleFunc("GET /api/documents", authMiddleware(listDocumentsHandler))
	mux.HandleFunc("POST /api/documents", authMiddleware(createDocumentHandler))
	mux.HandleFunc("GET /api/documents/{id}", authMiddleware(getDocumentHandler))
	mux.HandleFunc("PUT /api/documents/{id}", authMiddleware(updateDocumentHandler))
	mux.HandleFunc("PATCH /api/documents/{id}/status", authMiddleware(updateDocumentStatusHandler))
	mux.HandleFunc("DELETE /api/documents/{id}", authMiddleware(deleteDocumentHandler))

	// ---- Finance: Invoices ----
	mux.HandleFunc("GET /api/invoices", authMiddleware(listInvoicesHandler))
	mux.HandleFunc("POST /api/invoices", authMiddleware(createInvoiceHandler))
	mux.HandleFunc("GET /api/invoices/{id}", authMiddleware(getInvoiceHandler))
	mux.HandleFunc("PUT /api/invoices/{id}", authMiddleware(updateInvoiceHandler))
	mux.HandleFunc("POST /api/invoices/{id}/refund", authMiddleware(requestRefundHandler))
	mux.HandleFunc("DELETE /api/invoices/{id}", authMiddleware(deleteInvoiceHandler))

	// ---- Finance: Payments ----
	mux.HandleFunc("GET /api/payments", authMiddleware(listPaymentsHandler))
	mux.HandleFunc("POST /api/payments", authMiddleware(createPaymentHandler))
	mux.HandleFunc("DELETE /api/payments/{id}", authMiddleware(deletePaymentHandler))

	// ---- Partners ----
	mux.HandleFunc("GET /api/partners", authMiddleware(listPartnersHandler))
	mux.HandleFunc("POST /api/partners", authMiddleware(createPartnerHandler))
	mux.HandleFunc("GET /api/partners/{id}", authMiddleware(getPartnerHandler))
	mux.HandleFunc("PUT /api/partners/{id}", authMiddleware(updatePartnerHandler))
	mux.HandleFunc("DELETE /api/partners/{id}", authMiddleware(deletePartnerHandler))

	// ---- Static files ----
	mountStatic(mux)

	addr := ":" + port
	fmt.Printf("Go server listening on http://localhost%s\n", addr)
	server := &http.Server{Addr: addr, Handler: observeHTTP(protectHTTP(persistMutations(mux))), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 30 * time.Second, IdleTimeout: 60 * time.Second}
	signalContext, stopSignals := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stopSignals()
	serverFailed := false
	serverResult := make(chan error, 1)
	go func() { serverResult <- server.ListenAndServe() }()
	select {
	case <-signalContext.Done():
		shutdownContext, cancel := context.WithTimeout(context.Background(), 40*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownContext); err != nil {
			slog.Error("server_shutdown", "error", err)
		}
	case err := <-serverResult:
		if !errors.Is(err, http.ErrServerClosed) {
			serverFailed = true
			slog.Error("server_failed", "error", err)
		}
	}
	cancelWorkers()
	stopExpansion()
	stopLegacy()
	if serverFailed {
		database.Close()
		os.Exit(1)
	}
}

func mountStatic(mux *http.ServeMux) {
	root := findProjectRoot()

	indexPath := filepath.Join(root, "index.html")
	elmPath := filepath.Join(root, "elm.js")
	publicDir := filepath.Join(root, "public")

	log.Printf("Serving static files from: %s", root)

	fileServer := http.FileServer(http.Dir(publicDir))
	mux.Handle("/public/", http.StripPrefix("/public/", fileServer))

	mux.HandleFunc("/elm.js", func(w http.ResponseWriter, r *http.Request) {
		serveFileIfExists(w, r, elmPath, "application/javascript")
	})

	mux.HandleFunc("GET /account/{action}", func(w http.ResponseWriter, r *http.Request) {
		serveFileIfExists(w, r, filepath.Join(publicDir, "account.html"), "text/html; charset=utf-8")
	})
	mux.HandleFunc("GET /reset-password", func(w http.ResponseWriter, r *http.Request) {
		serveFileIfExists(w, r, filepath.Join(publicDir, "account.html"), "text/html; charset=utf-8")
	})
	mux.HandleFunc("GET /accept-invite", func(w http.ResponseWriter, r *http.Request) {
		serveFileIfExists(w, r, filepath.Join(publicDir, "account.html"), "text/html; charset=utf-8")
	})
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			writeError(w, http.StatusNotFound, "Not found")
			return
		}
		if r.URL.Path == "/" || r.URL.Path == "" {
			serveFileIfExists(w, r, indexPath, "text/html; charset=utf-8")
			return
		}
		if !hasStaticExtension(r.URL.Path) {
			serveFileIfExists(w, r, indexPath, "text/html; charset=utf-8")
			return
		}
		writeError(w, http.StatusNotFound, "Not found")
	})
}

func findProjectRoot() string {
	var candidates []string

	if exe, err := os.Executable(); err == nil {
		dir := filepath.Dir(exe)
		candidates = append(candidates, dir, filepath.Dir(dir), filepath.Dir(filepath.Dir(dir)))
	}
	if cwd, err := os.Getwd(); err == nil {
		candidates = append(candidates, cwd, filepath.Dir(cwd), filepath.Dir(filepath.Dir(cwd)))
	}

	for _, dir := range candidates {
		idx := filepath.Join(dir, "index.html")
		elm := filepath.Join(dir, "elm.js")
		if fileExists(idx) && fileExists(elm) {
			return dir
		}
	}
	return "."
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func hasStaticExtension(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	return ext != ""
}

func isAllowedStaticFile(path string) bool {
	switch strings.ToLower(filepath.Ext(path)) {
	case ".css", ".js", ".map", ".png", ".jpg", ".jpeg", ".gif",
		".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".webp",
		".html", ".json", ".txt", ".webmanifest":
		return true
	default:
		return false
	}
}

func serveFileIfExists(w http.ResponseWriter, r *http.Request, path, contentType string) {
	if _, err := os.Stat(path); err != nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", contentType)
	http.ServeFile(w, r, path)
}
