package main

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"
)

func expansionTestMux() http.Handler {
	m := http.NewServeMux()
	registerWorkspaceRoutes(m)
	m.HandleFunc("GET /api/contacts/{id}", authMiddleware(getContact))
	m.HandleFunc("POST /api/contacts", authMiddleware(createContact))
	m.HandleFunc("PUT /api/contacts/{id}", authMiddleware(updateContact))
	m.HandleFunc("DELETE /api/contacts/{id}", authMiddleware(deleteContact))
	return persistMutations(m)
}
func expansionRequest(t *testing.T, h http.Handler, method, path string, body any, version string) *httptest.ResponseRecorder {
	t.Helper()
	u, _ := findUserByEmail("demo@northwind.dev")
	token, err := issueToken(u)
	if err != nil {
		t.Fatal(err)
	}
	payload := ""
	if body != nil {
		payload = mustJSON(body)
	}
	r := httptest.NewRequest(method, path, strings.NewReader(payload))
	r.Header.Set("Authorization", "Bearer "+token)
	r.Header.Set("Content-Type", "application/json")
	if version != "" {
		r.Header.Set("If-Match", version)
	}
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	return w
}
func newBareContact(t *testing.T, h http.Handler) Contact {
	t.Helper()
	w := expansionRequest(t, h, "POST", "/api/contacts", map[string]any{"name": "Recoverable client", "email": "recover@example.com", "stage": "Lead"}, "")
	assertStatus(t, w, 201)
	var out struct{ Contact Contact }
	if err := json.Unmarshal(w.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	return out.Contact
}
func recordVersion(t *testing.T, h http.Handler, id string) string {
	t.Helper()
	w := expansionRequest(t, h, "GET", "/api/records/contacts/"+id, nil, "")
	assertStatus(t, w, 200)
	var out struct{ Record map[string]any }
	json.Unmarshal(w.Body.Bytes(), &out)
	return fmtString(out.Record["_revision"])
}
func TestRecordVersionRejectsStaleEditsAndDeletes(t *testing.T) {
	setupStore(t)
	h := expansionTestMux()
	c := newBareContact(t, h)
	version := recordVersion(t, h, c.ID)
	changed := map[string]any{"name": "Changed client", "email": c.Email, "stage": "Lead"}
	assertStatus(t, expansionRequest(t, h, "PUT", "/api/contacts/"+c.ID, changed, version), 200)
	assertStatus(t, expansionRequest(t, h, "PUT", "/api/contacts/"+c.ID, map[string]any{"name": "Stale client", "email": c.Email, "stage": "Lead"}, version), 409)
	assertStatus(t, expansionRequest(t, h, "DELETE", "/api/contacts/"+c.ID, nil, version), 409)
	w := expansionRequest(t, h, "GET", "/api/records/contacts/"+c.ID, nil, "")
	if !strings.Contains(w.Body.String(), "Changed client") {
		t.Fatal("stale update overwrote current data")
	}
}
func TestTrashRestoresDeletionBatchAndRejectsNewerRelatedChanges(t *testing.T) {
	setupStore(t)
	h := expansionTestMux()
	c := newBareContact(t, h)
	u, _ := findUserByEmail("demo@northwind.dev")
	mu.Lock()
	tasks = append(tasks, Task{RecordScope: c.RecordScope, ID: "task_recovery", ContactID: c.ID, Title: "Keep this task", Status: "todo"})
	deals = append(deals, Deal{RecordScope: c.RecordScope, ID: "deal_recovery", ContactID: c.ID, Title: "Keep this link", Stage: "Lead", CreatedAt: "2026-10-01", Owner: u.Name})
	mu.Unlock()
	if err := saveStore(); err != nil {
		t.Fatal(err)
	}
	assertStatus(t, expansionRequest(t, h, "DELETE", "/api/contacts/"+c.ID, nil, ""), 200)
	w := expansionRequest(t, h, "GET", "/api/trash", nil, "")
	assertStatus(t, w, 200)
	var out struct{ Batches []struct{ ID string } }
	json.Unmarshal(w.Body.Bytes(), &out)
	if len(out.Batches) != 1 {
		t.Fatal(w.Body.String())
	}
	id := out.Batches[0].ID
	mu.Lock()
	for i := range deals {
		if deals[i].ID == "deal_recovery" {
			deals[i].Title = "Newer change"
		}
	}
	mu.Unlock()
	assertStatus(t, expansionRequest(t, h, "POST", "/api/trash/"+id+"/restore", map[string]any{}, ""), 409)
	mu.Lock()
	for i := range deals {
		if deals[i].ID == "deal_recovery" {
			deals[i].Title = "Keep this link"
		}
	}
	mu.Unlock()
	assertStatus(t, expansionRequest(t, h, "POST", "/api/trash/"+id+"/restore", map[string]any{}, ""), 200)
	s := snapshot()
	foundTask, foundLink := false, false
	for _, task := range s.Tasks {
		foundTask = foundTask || task.ID == "task_recovery"
	}
	for _, deal := range s.Deals {
		foundLink = foundLink || (deal.ID == "deal_recovery" && deal.ContactID == c.ID)
	}
	if !foundTask || !foundLink {
		t.Fatal("restoration lost related records")
	}
	assertStatus(t, expansionRequest(t, h, "POST", "/api/trash/"+id+"/restore", map[string]any{}, ""), 404)
}
func TestSQLReadsBypassLegacyLockAndKeepOrganizationIsolation(t *testing.T) {
	setupStore(t)
	h := expansionTestMux()
	c := newBareContact(t, h)
	mutationMu.Lock()
	done := make(chan *httptest.ResponseRecorder, 1)
	go func() { done <- expansionRequest(t, h, "GET", "/api/records/contacts/"+c.ID, nil, "") }()
	select {
	case w := <-done:
		mutationMu.Unlock()
		assertStatus(t, w, 200)
	case <-time.After(2 * time.Second):
		mutationMu.Unlock()
		<-done
		t.Fatal("SQL record reads must not wait on the legacy mutation lock")
	}
	mu.Lock()
	foreign := c
	foreign.ID = "foreign_record"
	foreign.OrgID = "foreign_org"
	contacts = append(contacts, foreign)
	mu.Unlock()
	if err := saveStore(); err != nil {
		t.Fatal(err)
	}
	assertStatus(t, expansionRequest(t, h, "GET", "/api/records/contacts/foreign_record", nil, ""), 404)
}
func TestReportingUsesAllRecordsAndCohortDates(t *testing.T) {
	setupStore(t)
	u, _ := findUserByEmail("demo@northwind.dev")
	scope := RecordScope{OrgID: u.OrgID, OwnerID: u.ID, Visibility: "organization"}
	mu.Lock()
	deals = nil
	for i := 0; i < 501; i++ {
		deals = append(deals, Deal{RecordScope: scope, ID: newID("deal"), Stage: "Won", Value: 1, Currency: "USD", CreatedAt: "2026-01-01"})
	}
	leads = []Lead{{RecordScope: scope, ID: "lead_cohort", Source: "Website", Status: "Converted", CreatedAt: "2026-01-05"}, {RecordScope: scope, ID: "lead_other", Source: "Website", Status: "New", CreatedAt: "2025-01-05"}}
	mu.Unlock()
	if err := saveStore(); err != nil {
		t.Fatal(err)
	}
	r := httptest.NewRecorder()
	handleReports(r, httptest.NewRequest("GET", "/api/reports", nil))
	var totals reportSummary
	json.Unmarshal(r.Body.Bytes(), &totals)
	if totals.StageCounts["Won"] != 501 || totals.CreatedCounts["2026-01-01"] < 501 {
		t.Fatal("dashboard depended on a frontend page")
	}
	w := expansionRequest(t, expansionTestMux(), "GET", "/api/insights?from=2026-01-01&to=2026-12-31", nil, "")
	assertStatus(t, w, 200)
	var out struct{ Sources []conversionMetric }
	json.Unmarshal(w.Body.Bytes(), &out)
	if len(out.Sources) != 1 || out.Sources[0].Leads != 1 || out.Sources[0].Rate != 100 {
		t.Fatal(w.Body.String())
	}
	assertStatus(t, expansionRequest(t, expansionTestMux(), "GET", "/api/insights?from=invalid", nil, ""), 400)
}
func TestPortalCredentialsAreSingleUseScopedAndRevocable(t *testing.T) {
	setupStore(t)
	h := expansionTestMux()
	c := newBareContact(t, h)
	w := expansionRequest(t, h, "POST", "/api/portal/invitations", map[string]string{"contactId": c.ID, "email": c.Email}, "")
	assertStatus(t, w, 201)
	var invite struct{ ID, URL string }
	json.Unmarshal(w.Body.Bytes(), &invite)
	token := strings.Split(invite.URL, "#invite=")[1]
	w = featureRequest(h, "POST", "/api/portal/session", map[string]string{"token": token}, nil)
	assertStatus(t, w, 200)
	cookies := w.Result().Cookies()
	if len(cookies) != 1 || !cookies[0].HttpOnly {
		t.Fatal("portal sessions must be HttpOnly")
	}
	assertStatus(t, featureRequest(h, "POST", "/api/portal/session", map[string]string{"token": token}, nil), 401)
	assertStatus(t, featureRequest(h, "POST", "/api/portal/session", map[string]string{"token": cookies[0].Value}, nil), 401)
	assertStatus(t, featureRequest(h, "GET", "/api/contacts/"+c.ID, nil, cookies), 401)
	w = featureRequest(h, "GET", "/api/portal/me", nil, cookies)
	assertStatus(t, w, 200)
	if strings.Contains(w.Body.String(), "Ada Lovelace") || strings.Contains(w.Body.String(), "notes") {
		t.Fatal("portal exposed unrelated/internal records")
	}
	assertStatus(t, featureRequest(h, "POST", "/api/portal/documents/doc_1/files", nil, cookies), 404)
	assertStatus(t, featureRequest(h, "POST", "/api/portal/messages", map[string]string{"caseId": "case_1", "body": "foreign"}, cookies), 404)
	assertStatus(t, expansionRequest(t, h, "DELETE", "/api/portal/invitations/"+invite.ID, nil, ""), 200)
	assertStatus(t, featureRequest(h, "GET", "/api/portal/me", nil, cookies), 401)
}
func TestSignedInboundEmailDeduplicatesAndPreservesContactScope(t *testing.T) {
	setupStore(t)
	t.Setenv("INBOUND_EMAIL_SECRET", "inbound-test-secret")
	h := expansionTestMux()
	c := newBareContact(t, h)
	payload := []byte(mustJSON(inboundMessage{ID: "provider-1", OrgID: c.OrgID, From: c.Email, Subject: "Reply", Body: "Please review"}))
	send := func(signature string) *httptest.ResponseRecorder { return signedEmailRequest(h, payload, signature) }
	assertStatus(t, send("invalid"), 401)
	before := len(snapshot().Activities)
	assertStatus(t, send("valid"), 202)
	assertStatus(t, send("valid"), 202)
	s := snapshot()
	if len(s.Activities) != before+1 {
		t.Fatal("provider retry duplicated activities")
	}
	a := s.Activities[len(s.Activities)-1]
	if a.ContactID != c.ID || a.RecordScope != c.RecordScope {
		t.Fatal("incoming mail widened record visibility")
	}
}
func signedEmailRequest(h http.Handler, payload []byte, signature string) *httptest.ResponseRecorder {
	stamp := strconv.FormatInt(time.Now().Unix(), 10)
	r := httptest.NewRequest("POST", "/api/inbound/email", bytes.NewReader(payload))
	r.Header.Set("X-ECC-Timestamp", stamp)
	if signature == "valid" {
		mac := hmac.New(sha256.New, []byte("inbound-test-secret"))
		mac.Write(append([]byte(stamp+"."), payload...))
		signature = hex.EncodeToString(mac.Sum(nil))
	}
	r.Header.Set("X-ECC-Signature", signature)
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	return w
}

type testTransport func(*http.Request) (*http.Response, error)

func (f testTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }
func TestAssistantUsesResponsesWithoutStorageAndRequiresActivation(t *testing.T) {
	setupStore(t)
	t.Setenv("OPENAI_API_KEY", "test-key")
	t.Setenv("OPENAI_MODEL", "configured-model")
	h := expansionTestMux()
	c := newBareContact(t, h)
	assertStatus(t, expansionRequest(t, h, "POST", "/api/assistant", map[string]string{"entity": "contacts", "id": c.ID, "action": "summary"}, ""), 503)
	assertStatus(t, expansionRequest(t, h, "PUT", "/api/admin/assistant", map[string]bool{"enabled": true}, ""), 200)
	w := expansionRequest(t, h, "POST", "/api/assistant", map[string]string{"entity": "contacts", "id": c.ID, "action": "summary"}, "")
	assertStatus(t, w, 202)
	var queued struct{ ID string }
	json.Unmarshal(w.Body.Bytes(), &queued)
	original := providerHTTP
	t.Cleanup(func() { providerHTTP = original })
	providerHTTP = &http.Client{Transport: testTransport(func(r *http.Request) (*http.Response, error) {
		var body map[string]any
		json.NewDecoder(r.Body).Decode(&body)
		if r.URL.Path != "/v1/responses" || body["store"] != false || body["model"] != "configured-model" {
			t.Fatal("incorrect provider request")
		}
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(`{"status":"completed","output":[{"content":[{"type":"output_text","text":"Reviewable summary"}]}]}`)), Header: make(http.Header)}, nil
	})}
	processAssistantJobs(context.Background())
	w = expansionRequest(t, h, "GET", "/api/assistant/jobs/"+queued.ID, nil, "")
	assertStatus(t, w, 200)
	if !strings.Contains(w.Body.String(), "Reviewable summary") || strings.Contains(w.Body.String(), `"input"`) {
		t.Fatal(w.Body.String())
	}
	var count int
	database.QueryRow("SELECT count(*) FROM mail_outbox WHERE contact_id=?", c.ID).Scan(&count)
	if count != 0 {
		t.Fatal("AI must never send a message automatically")
	}
}

func TestSQLReadsUseCommittedRolesEvenWhenCacheContainsUncommittedRoleChange(t *testing.T) {
	setupStore(t)
	h := expansionTestMux()
	u, _ := findUserByEmail("demo@northwind.dev")
	// Commit a member role, then simulate the temporary cache state of an admin grant.
	u.Role = "member"
	mu.Lock()
	users[u.Email] = u
	private := Contact{RecordScope: RecordScope{OrgID: u.OrgID, OwnerID: "another_user", Visibility: "private"}, ID: "private_other", Name: "Restricted", Stage: "Lead"}
	contacts = append(contacts, private)
	mu.Unlock()
	if err := saveStore(); err != nil {
		t.Fatal(err)
	}
	u.Role = "admin"
	mu.Lock()
	users[u.Email] = u
	mu.Unlock()
	assertStatus(t, expansionRequest(t, h, "GET", "/api/records/contacts/private_other", nil, ""), 404)
}

func TestPureRecordFingerprintsIgnoreOnlyRevisionMetadata(t *testing.T) {
	a := map[string]any{"id": "record", "visibility": "private", "name": "Client", "balance": 10.0}
	b := map[string]any{"name": "Client", "visibility": "private", "id": "record", "balance": 10.0, "_revision": "old"}
	if versionOf(a) != versionOf(b) {
		t.Fatal("fingerprint depends on response metadata or map order")
	}
	b["name"] = "Changed"
	if versionOf(a) == versionOf(b) {
		t.Fatal("fingerprint ignored a record change")
	}
	result := withRecordVersions(map[string]any{"records": []any{a}, "user": map[string]any{"id": "staff", "email": "staff@example.com"}}).(map[string]any)
	if fmtString(result["records"].([]any)[0].(map[string]any)["_revision"]) == "" {
		t.Fatal("nested records lack versions")
	}
	if _, ok := result["user"].(map[string]any)["_revision"]; ok {
		t.Fatal("account is not a versioned CRM record")
	}
}
func TestPureCohortMetricsUseExplicitIntakesAndEnrolmentStates(t *testing.T) {
	s := diskStore{Leads: []Lead{{Source: "Website", Status: "Converted", CreatedAt: "2026-02-01"}, {Source: "Website", Status: "New", CreatedAt: "2026-02-02"}, {Source: "Referral", Status: "Converted", CreatedAt: "2025-01-01"}}, Students: []Student{{SchoolID: "school", SchoolName: "College", AgentID: "agent", AgentName: "Adviser", Intake: "September 2026", ApplicationStage: "Enrolled", CreatedAt: "2026-02-01"}, {SchoolID: "school", SchoolName: "College", ApplicationStage: "Accepted", CreatedAt: "2026-02-02"}}}
	sources, schools, agents := cohortMetrics(s, "2026-01-01", "2026-12-31")
	if len(sources) != 1 || sources[0].Leads != 2 || sources[0].Converted != 1 || sources[0].Rate != 50 {
		t.Fatalf("incorrect conversion: %+v", sources)
	}
	if len(schools) != 2 || schools[0].Intake != "September 2026" || schools[0].Enrolled != 1 || schools[1].Intake != "Unspecified" || schools[1].Enrolled != 0 {
		t.Fatalf("incorrect enrolment grouping: %+v", schools)
	}
	if len(agents) != 2 {
		t.Fatalf("unassigned agent group was dropped: %+v", agents)
	}
}
func TestPureProviderValidationRejectsUnsafeLinksAndInvalidSignatures(t *testing.T) {
	for _, url := range []string{"http://graph.microsoft.com/v1.0/me", "https://evil.example/v1.0/me", "https://graph.microsoft.com.evil.example/v1.0/me", "https://user@graph.microsoft.com/v1.0/me", "https://graph.microsoft.com:443/v1.0/me"} {
		if validGraphLink(url) {
			t.Fatalf("unsafe cursor accepted: %s", url)
		}
	}
	if !validGraphLink("https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages/delta?$deltatoken=token") {
		t.Fatal("valid delta link rejected")
	}
	body := []byte("payload")
	mac := hmac.New(sha256.New, []byte("secret"))
	mac.Write(body)
	signature := hex.EncodeToString(mac.Sum(nil))
	if !signedInbound("secret", signature, body) || signedInbound("", signature, body) || signedInbound("secret", signature, []byte("changed")) {
		t.Fatal("signature validation failed")
	}
	if !subjectCaseReference("Re: [ECC-001] Document update", "ECC-001") || subjectCaseReference("ECC-0012", "ECC-001") {
		t.Fatal("case references must match complete tokens")
	}
}
