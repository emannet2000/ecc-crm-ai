package main

import (
	"bytes"
	"context"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Password hashes are persisted separately from the public User representation.
type storedUser struct {
	LastTOTPStep   int64
	User           User
	Password       string
	SessionVersion int
	TOTPSecret     string
	RecoveryHashes []string
}
type diskStore struct {
	Version    int
	Users      map[string]storedUser
	Contacts   []Contact
	Deals      []Deal
	Activities []Activity
	Tasks      []Task
	Schools    []School
	Students   []Student
	Agents     []Agent
	Leads      []Lead
	Cases      []Case
	Documents  []Document
	Invoices   []Invoice
	Payments   []Payment
	Partners   []Partner
	Revoked    map[string]time.Time
}

var mutationMu sync.Mutex
var dataPath string

func snapshot() diskStore {
	mu.RLock()
	defer mu.RUnlock()
	revokedMu.RLock()
	defer revokedMu.RUnlock()
	savedUsers := make(map[string]storedUser, len(users))
	for key, user := range users {
		savedUsers[key] = storedUser{User: user, Password: user.Password, SessionVersion: user.SessionVersion, TOTPSecret: user.TOTPSecret, RecoveryHashes: user.RecoveryHashes, LastTOTPStep: user.LastTOTPStep}
	}
	return diskStore{1, savedUsers, contacts, deals, activities, tasks, schools, students, agents, leads, cases, documents, invoices, payments, partners, revokedTokens}
}

func restoreStore(saved diskStore) {
	mu.Lock()
	defer mu.Unlock()
	users = make(map[string]User, len(saved.Users))
	for key, stored := range saved.Users {
		user := stored.User
		user.Password = stored.Password
		user.SessionVersion = stored.SessionVersion
		user.TOTPSecret = stored.TOTPSecret
		user.LastTOTPStep = stored.LastTOTPStep
		user.RecoveryHashes = stored.RecoveryHashes
		users[key] = user
	}
	contacts, deals, activities, tasks = saved.Contacts, saved.Deals, saved.Activities, saved.Tasks
	schools, students, agents, leads = saved.Schools, saved.Students, saved.Agents, saved.Leads
	cases, documents, invoices, payments, partners = saved.Cases, saved.Documents, saved.Invoices, saved.Payments, saved.Partners
	revokedMu.Lock()
	revokedTokens = saved.Revoked
	if revokedTokens == nil {
		revokedTokens = map[string]time.Time{}
	}
	revokedMu.Unlock()
}

type bufferedResponse struct {
	header http.Header
	status int
	body   bytes.Buffer
}

func (w *bufferedResponse) Header() http.Header { return w.header }
func (w *bufferedResponse) WriteHeader(status int) {
	if w.status == 0 {
		w.status = status
	}
}
func (w *bufferedResponse) Write(p []byte) (int, error) {
	if w.status == 0 {
		w.status = 200
	}
	return w.body.Write(p)
}

func persistMutations(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.URL.Path, "/api/") || independentRead(r) {
			next.ServeHTTP(w, r)
			return
		}
		mutationMu.Lock()
		defer mutationMu.Unlock()
		meta := &requestMeta{}
		r = r.WithContext(context.WithValue(r.Context(), requestMetaKey, meta))
		if r.Method == "GET" || r.Method == "HEAD" || r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}
		if r.URL.Path != "/api/saml/acs" && r.URL.Path != "/api/payments/stripe/webhook" && !validOrigin(r) {
			writeError(w, 403, "Cross-origin changes are not allowed")
			return
		}
		before := cloneStore()
		tx, err := database.Begin()
		if err != nil {
			writeError(w, 503, "Database unavailable")
			return
		}
		defer tx.Rollback()
		r = r.WithContext(context.WithValue(r.Context(), requestTxKey, tx))
		response := &bufferedResponse{header: make(http.Header)}
		next.ServeHTTP(response, r)
		if response.status == 0 {
			response.status = 200
		}
		success := (response.status >= 200 && response.status < 300) || (r.URL.Path == "/api/saml/acs" && response.status == 303)
		if success {
			actor := meta.Actor
			if actor == "" {
				actor = requestActor(r)
			}
			events := changesBetween(before, snapshot(), actor)
			err = archiveDeleted(r, before, snapshot(), actor)
			if err == nil {
				err = saveDatabaseTx(tx, events)
			}
			if err == nil {
				err = queueChangeEvents(r, events)
			}
			if err == nil {
				err = tx.Commit()
			}
		} else {
			restoreStore(before)
			if meta.PersistFailure {
				err = tx.Commit()
			}
		}
		if err != nil || !success {
			restoreStore(before)
			for _, cleanup := range meta.Rollback {
				cleanup()
			}
		}
		if err != nil {
			writeError(w, 500, "Could not save changes to the database")
			return
		}
		if success {
			for _, action := range meta.AfterCommit {
				action()
			}
		}
		for key, values := range response.header {
			w.Header()[key] = values
		}
		w.WriteHeader(response.status)
		w.Write(response.body.Bytes())
	})
}
