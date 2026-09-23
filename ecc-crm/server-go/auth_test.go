package main

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func resetAuthState(t *testing.T) {
	t.Helper()
	mu.Lock()
	users = map[string]User{}
	mu.Unlock()
	jwtSecret = []byte("test-secret-for-unit-tests")
}

func seedTestUser(t *testing.T, email, password, name string) User {
	t.Helper()
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	if err != nil {
		t.Fatalf("hash: %v", err)
	}
	u := User{ID: "u_test_1", Name: name, Email: email, Password: string(hash)}
	mu.Lock()
	users[email] = u
	mu.Unlock()
	return u
}

func decodeError(t *testing.T, rr *httptest.ResponseRecorder) string {
	t.Helper()
	var er errorResponse
	if err := json.NewDecoder(rr.Body).Decode(&er); err != nil {
		t.Fatalf("decode: %v body=%q", err, rr.Body.String())
	}
	return er.Error
}

func TestIssueToken(t *testing.T) {
	resetAuthState(t)
	u := User{ID: "u_42", Name: "Alice", Email: "alice@example.com"}
	tokenStr, err := issueToken(u)
	if err != nil {
		t.Fatal(err)
	}
	parsed, err := jwt.Parse(tokenStr, func(tok *jwt.Token) (any, error) { return jwtSecret, nil })
	if err != nil || !parsed.Valid {
		t.Fatalf("parse: %v valid=%v", err, parsed != nil && parsed.Valid)
	}
	claims := parsed.Claims.(jwt.MapClaims)
	if claims["sub"] != "u_42" || claims["email"] != "alice@example.com" {
		t.Fatalf("claims: %v", claims)
	}
}

func TestHandleLogin_Success(t *testing.T) {
	resetAuthState(t)
	seedTestUser(t, "demo@test.dev", "Demo1234", "Demo")
	body, _ := json.Marshal(loginRequest{Email: "demo@test.dev", Password: "Demo1234"})
	rr := httptest.NewRecorder()
	handleLogin(rr, httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewReader(body)))
	if rr.Code != 200 {
		t.Fatalf("status %d body %s", rr.Code, rr.Body.String())
	}
	var res authResponse
	json.NewDecoder(rr.Body).Decode(&res)
	if res.Token == "" || res.User.Email != "demo@test.dev" {
		t.Fatalf("bad response %+v", res)
	}
}

func TestHandleLogin_WrongPassword(t *testing.T) {
	resetAuthState(t)
	seedTestUser(t, "demo@test.dev", "Demo1234", "Demo")
	body, _ := json.Marshal(loginRequest{Email: "demo@test.dev", Password: "wrong"})
	rr := httptest.NewRecorder()
	handleLogin(rr, httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewReader(body)))
	if rr.Code != 401 {
		t.Fatalf("status %d", rr.Code)
	}
}

func TestHandleRegister_Success(t *testing.T) {
	resetAuthState(t)
	body, _ := json.Marshal(registerRequest{Name: "New", Email: "new@test.dev", Password: "password123"})
	rr := httptest.NewRecorder()
	handleRegister(rr, httptest.NewRequest(http.MethodPost, "/api/register", bytes.NewReader(body)))
	if rr.Code != 200 {
		t.Fatalf("status %d %s", rr.Code, rr.Body.String())
	}
}

func TestHandleRegister_Duplicate(t *testing.T) {
	resetAuthState(t)
	seedTestUser(t, "exists@test.dev", "password123", "X")
	body, _ := json.Marshal(registerRequest{Name: "Y", Email: "exists@test.dev", Password: "password123"})
	rr := httptest.NewRecorder()
	handleRegister(rr, httptest.NewRequest(http.MethodPost, "/api/register", bytes.NewReader(body)))
	if rr.Code != 409 {
		t.Fatalf("status %d", rr.Code)
	}
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	resetAuthState(t)
	u := seedTestUser(t, "a@test.dev", "password123", "A")
	tok, _ := issueToken(u)
	var gotEmail string
	h := authMiddleware(func(w http.ResponseWriter, r *http.Request) {
		gotEmail, _ = r.Context().Value(ctxUserEmail).(string)
		w.WriteHeader(200)
	})
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	req.Header.Set("Authorization", "Bearer "+tok)
	h(rr, req)
	if rr.Code != 200 || gotEmail != u.Email {
		t.Fatalf("code=%d email=%q", rr.Code, gotEmail)
	}
}

func TestAuthMiddleware_Expired(t *testing.T) {
	resetAuthState(t)
	claims := jwt.MapClaims{"sub": "u", "email": "e@t.dev", "exp": time.Now().Add(-time.Hour).Unix()}
	tok, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(jwtSecret)
	called := false
	h := authMiddleware(func(w http.ResponseWriter, r *http.Request) { called = true })
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	req.Header.Set("Authorization", "Bearer "+tok)
	h(rr, req)
	if called || rr.Code != 401 {
		t.Fatalf("called=%v code=%d", called, rr.Code)
	}
}

func TestHandleMe_Success(t *testing.T) {
	resetAuthState(t)
	u := seedTestUser(t, "me@test.dev", "password123", "Me")
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	ctx := context.WithValue(req.Context(), ctxUserEmail, u.Email)
	handleMe(rr, req.WithContext(ctx))
	if rr.Code != 200 {
		t.Fatalf("status %d", rr.Code)
	}
}

func TestHandleLogin_BadBody(t *testing.T) {
	resetAuthState(t)
	rr := httptest.NewRecorder()
	handleLogin(rr, httptest.NewRequest(http.MethodPost, "/api/login", strings.NewReader("{bad")))
	if rr.Code != 400 {
		t.Fatalf("status %d", rr.Code)
	}
}
