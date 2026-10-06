package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret []byte

var (
	revokedMu     sync.RWMutex
	revokedTokens = map[string]time.Time{}
)

func initSecret() { initializePersistentSecret() }

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type updateMeRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type changePasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

type authResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type profileUpdateResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type errorResponse struct {
	Error string `json:"error"`
}

type userResponse struct {
	User User `json:"user"`
}

type statusResponse struct {
	Status string `json:"status"`
}

type contextKey string

const (
	ctxUserID    contextKey = "userID"
	ctxUserEmail contextKey = "userEmail"
	ctxTokenID   contextKey = "tokenID"
)

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, errorResponse{Error: msg})
}

func issueToken(u User) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":   u.ID,
		"ver":   u.SessionVersion,
		"email": u.Email,
		"jti":   newID("jti"),
		"exp":   now.Add(24 * time.Hour).Unix(),
		"iat":   now.Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if sessionUser, sessionID, err := cookieIdentity(r); err == nil {
			authorizeWorkspaceRequest(next, w, r, sessionUser, sessionID)
			return
		}
		auth := r.Header.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			writeError(w, http.StatusUnauthorized, "Missing authorization header")
			return
		}
		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
			return jwtSecret, nil
		}, jwt.WithValidMethods([]string{"HS256"}), jwt.WithExpirationRequired())
		if err != nil || !token.Valid {
			writeError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			writeError(w, http.StatusUnauthorized, "Invalid token claims")
			return
		}
		email, _ := claims["email"].(string)
		id, _ := claims["sub"].(string)
		jti, _ := claims["jti"].(string)

		user, exists := findUserByEmail(email)
		version, _ := claims["ver"].(float64)
		if !exists || user.ID != id || user.Disabled || int(version) != user.SessionVersion {
			writeError(w, http.StatusUnauthorized, "Session has expired")
			return
		}

		if jti != "" && isTokenRevoked(jti) {
			writeError(w, http.StatusUnauthorized, "Token has been revoked")
			return
		}

		authorizeWorkspaceRequest(next, w, r, user, jti)
	}
}

func isTokenRevoked(jti string) bool {
	revokedMu.RLock()
	defer revokedMu.RUnlock()
	exp, ok := revokedTokens[jti]
	if !ok {
		return false
	}
	if time.Now().After(exp) {
		return false
	}
	return true
}

func revokeToken(jti string, exp time.Time) {
	if jti == "" {
		return
	}
	revokedMu.Lock()
	defer revokedMu.Unlock()
	revokedTokens[jti] = exp
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, ok := findUserByEmail(req.Email)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token, err := issueToken(user)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not issue token")
		return
	}
	writeJSON(w, http.StatusOK, authResponse{Token: token, User: user})
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Name == "" || req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "Name, email, and password are required")
		return
	}
	if len(req.Password) < 8 {
		writeError(w, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}

	mu.Lock()
	emailKey := strings.ToLower(strings.TrimSpace(req.Email))
	if _, exists := users[emailKey]; exists {
		mu.Unlock()
		writeError(w, http.StatusConflict, "An account with that email already exists")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		mu.Unlock()
		writeError(w, http.StatusInternalServerError, "Could not create account")
		return
	}
	user := User{
		ID:       newID("u"),
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hash),
	}
	users[emailKey] = user
	mu.Unlock()

	token, err := issueToken(user)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not issue token")
		return
	}
	writeJSON(w, http.StatusOK, authResponse{Token: token, User: user})
}

func handleMe(w http.ResponseWriter, r *http.Request) {
	email, _ := r.Context().Value(ctxUserEmail).(string)
	if email == "" {
		writeError(w, http.StatusUnauthorized, "Invalid token claims")
		return
	}
	user, ok := findUserByEmail(email)
	if !ok {
		writeError(w, http.StatusUnauthorized, "User not found")
		return
	}
	writeJSON(w, http.StatusOK, userResponse{User: user})
}

func handleUpdateMe(w http.ResponseWriter, r *http.Request) {
	oldEmail, _ := r.Context().Value(ctxUserEmail).(string)
	if oldEmail == "" {
		writeError(w, http.StatusUnauthorized, "Invalid token claims")
		return
	}

	var req updateMeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	name := strings.TrimSpace(req.Name)
	email := strings.TrimSpace(strings.ToLower(req.Email))

	fields := map[string]string{}
	if name == "" {
		fields["name"] = "Name is required"
	}
	if email == "" {
		fields["email"] = "Email is required"
	} else if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		fields["email"] = "Please enter a valid email"
	}
	if len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	oldKey := strings.ToLower(strings.TrimSpace(oldEmail))

	mu.Lock()
	user, ok := users[oldKey]
	if !ok {
		mu.Unlock()
		writeError(w, http.StatusUnauthorized, "User not found")
		return
	}

	if email != oldKey {
		if _, taken := users[email]; taken {
			mu.Unlock()
			writeFieldErrors(w, map[string]string{"email": "That email is already in use"})
			return
		}
	}

	oldName := user.Name
	user.Name = name
	user.Email = email

	if email != oldKey {
		delete(users, oldKey)
	}
	users[email] = user
	mu.Unlock()

	mu.Lock()
	for i := range contacts {
		if contacts[i].Owner == oldName && canWrite(contacts[i].RecordScope, user) {
			contacts[i].Owner = name
		}
	}
	for i := range deals {
		if deals[i].Owner == oldName && canWrite(deals[i].RecordScope, user) {
			deals[i].Owner = name
		}
	}
	for i := range tasks {
		if tasks[i].Owner == oldName && canWrite(tasks[i].RecordScope, user) {
			tasks[i].Owner = name
		}
	}
	for i := range activities {
		if activities[i].CreatedBy == oldName && canWrite(activities[i].RecordScope, user) {
			activities[i].CreatedBy = name
		}
	}
	mu.Unlock()

	token, err := issueToken(user)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not issue token")
		return
	}
	if err := mintSession(w, r, user, true); err != nil {
		writeError(w, 500, "Could not refresh session")
		return
	}
	if _, err := r.Cookie("ecc_session"); err == nil {
		token = "cookie-session"
	}
	writeJSON(w, http.StatusOK, profileUpdateResponse{Token: token, User: user})
}

func handleChangePassword(w http.ResponseWriter, r *http.Request) {
	email, _ := r.Context().Value(ctxUserEmail).(string)
	if email == "" {
		writeError(w, http.StatusUnauthorized, "Invalid token claims")
		return
	}

	var req changePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	fields := map[string]string{}
	if req.CurrentPassword == "" {
		fields["current"] = "Enter your current password"
	}
	if message := passwordError(req.NewPassword); message != "" {
		fields["next"] = message
	}
	if len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	emailKey := strings.ToLower(strings.TrimSpace(email))

	mu.Lock()
	defer mu.Unlock()

	user, ok := users[emailKey]
	if !ok {
		writeError(w, http.StatusUnauthorized, "User not found")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
		writeFieldErrors(w, map[string]string{"current": "Current password is incorrect"})
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not update password")
		return
	}
	user.Password = string(hash)
	user.SessionVersion++
	users[emailKey] = user
	if err := mintSession(w, r, user, true); err != nil {
		writeError(w, 500, "Could not refresh session")
		return
	}

	writeJSON(w, http.StatusOK, statusResponse{Status: "ok"})
}

func handleLogoutAll(w http.ResponseWriter, r *http.Request) {
	email, _ := r.Context().Value(ctxUserEmail).(string)
	jti, _ := r.Context().Value(ctxTokenID).(string)
	if email == "" {
		writeError(w, http.StatusUnauthorized, "Invalid token claims")
		return
	}

	mu.Lock()
	key := strings.ToLower(strings.TrimSpace(email))
	user, exists := users[key]
	if exists {
		user.SessionVersion++
		users[key] = user
	}
	mu.Unlock()

	if jti != "" {
		revokeToken(jti, time.Now().Add(24*time.Hour))
	}

	writeJSON(w, http.StatusOK, statusResponse{Status: "ok"})
}
