 package main

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "strings"
    "time"

    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
)

var jwtSecret []byte

func initSecret() {
    s := os.Getenv("JWT_SECRET")
    if s == "" {
        s = "dev-secret-not-for-production-please-change-me"
        log.Println("WARNING: JWT_SECRET not set, using insecure dev default")
    }
    jwtSecret = []byte(s)
}

type loginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type registerRequest struct {
    Name     string `json:"name"`
    Email    string `json:"email"`
    Password string `json:"password"`
}

type authResponse struct {
    Token string `json:"token"`
    User  User   `json:"user"`
}

type errorResponse struct {
    Error string `json:"error"`
}

type userResponse struct {
    User User `json:"user"`
}

// contextKey is a private type for values stored on the request context,
// avoiding collisions with any other package's context keys.
type contextKey string

const (
    ctxUserID    contextKey = "userID"
    ctxUserEmail contextKey = "userEmail"
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
    claims := jwt.MapClaims{
        "sub":   u.ID,
        "email": u.Email,
        "exp":   time.Now().Add(24 * time.Hour).Unix(),
        "iat":   time.Now().Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}

// authMiddleware validates the bearer token and injects the caller's ID and
// email onto the request context so downstream handlers don't need to
// re-parse the JWT.
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        auth := r.Header.Get("Authorization")
        if !strings.HasPrefix(auth, "Bearer ") {
            writeError(w, http.StatusUnauthorized, "Missing authorization header")
            return
        }
        tokenStr := strings.TrimPrefix(auth, "Bearer ")
        token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
            return jwtSecret, nil
        })
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

        ctx := context.WithValue(r.Context(), ctxUserEmail, email)
        ctx = context.WithValue(ctx, ctxUserID, id)
        next(w, r.WithContext(ctx))
    }
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
    if _, exists := users[req.Email]; exists {
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
    users[req.Email] = user
    mu.Unlock()

    token, err := issueToken(user)
    if err != nil {
        writeError(w, http.StatusInternalServerError, "Could not issue token")
        return
    }
    writeJSON(w, http.StatusOK, authResponse{Token: token, User: user})
}

// handleMe assumes it is wrapped by authMiddleware, which has already
// validated the token and populated the context.
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