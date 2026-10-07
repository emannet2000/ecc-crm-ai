package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"os"
	"strings"
	"time"
)

// Settings default to the current read-only experience. New capabilities are
// explicit workspace controls; credentials always stay in the server environment.
type aiSettings struct {
	Enabled             bool    `json:"enabled"`
	Model               string  `json:"model"`
	RecordContext       bool    `json:"recordContext"`
	Knowledge           bool    `json:"knowledge"`
	Reports             bool    `json:"reports"`
	Actions             bool    `json:"actions"`
	Proactive           bool    `json:"proactive"`
	Voice               bool    `json:"voice"`
	RealtimeModel       string  `json:"realtimeModel"`
	DailyRequests       int     `json:"dailyRequests"`
	DailyTokens         int     `json:"dailyTokens"`
	DailyBudgetUSD      float64 `json:"dailyBudgetUSD"`
	InputUSDPerMillion  float64 `json:"inputUSDPerMillion"`
	OutputUSDPerMillion float64 `json:"outputUSDPerMillion"`
	VoiceSessionUSD     float64 `json:"voiceSessionUSD"`
	VoiceTokenAllowance int     `json:"voiceTokenAllowance"`
	VoiceSeconds        int     `json:"voiceSeconds"`
}

func defaultAISettings() aiSettings {
	return aiSettings{Model: os.Getenv("OPENAI_MODEL"), RecordContext: true, Knowledge: true, Reports: true, Actions: true, DailyRequests: 100, DailyTokens: 1000000, VoiceSeconds: 300, VoiceTokenAllowance: 30000, RealtimeModel: os.Getenv("OPENAI_REALTIME_MODEL")}
}
func loadAISettings(r *http.Request) aiSettings {
	settings := defaultAISettings()
	var data string
	if storeDB(r).QueryRow("SELECT data FROM workspace_entries WHERE id=? AND org_id=?", "ai_"+currentUser(r).OrgID, currentUser(r).OrgID).Scan(&data) == nil {
		json.Unmarshal([]byte(data), &settings)
	}
	return settings
}
func saveAISettings(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	settings := loadAISettings(r)
	if !decodeRequest(w, r, &settings) {
		return
	}
	settings.Model = strings.TrimSpace(settings.Model)
	settings.RealtimeModel = strings.TrimSpace(settings.RealtimeModel)
	if len(settings.Model) > 100 || len(settings.RealtimeModel) > 100 || settings.DailyRequests < 1 || settings.DailyRequests > 100000 || settings.DailyTokens < 1000 || settings.DailyTokens > 1000000000 || settings.VoiceTokenAllowance < 1000 || settings.VoiceTokenAllowance > 1000000 || settings.VoiceSeconds < 30 || settings.VoiceSeconds > 900 || !finiteNonnegative(settings.DailyBudgetUSD) || !finiteNonnegative(settings.InputUSDPerMillion) || !finiteNonnegative(settings.OutputUSDPerMillion) || !finiteNonnegative(settings.VoiceSessionUSD) {
		writeError(w, 400, "Enter valid request/token limits, nonnegative prices, and a voice duration from 30 to 900 seconds")
		return
	}
	if settings.DailyBudgetUSD > 0 && (settings.InputUSDPerMillion <= 0 || settings.OutputUSDPerMillion <= 0 || (settings.Voice && settings.VoiceSessionUSD <= 0)) {
		writeError(w, 400, "A dollar budget requires configured input/output prices and a voice-session allowance when voice is enabled")
		return
	}
	if _, err := storeDB(r).Exec("INSERT INTO workspace_entries VALUES(?,?,'assistant_settings','','',?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at", "ai_"+currentUser(r).OrgID, currentUser(r).OrgID, mustJSON(settings), utcNow(), utcNow()); err != nil {
		writeError(w, 500, "Could not save AI settings")
		return
	}
	writeJSON(w, 200, settings)
}
func finiteNonnegative(value float64) bool {
	return value >= 0 && !math.IsNaN(value) && !math.IsInf(value, 0) && value < 1000000000
}

func migrateAI(tx *sql.Tx) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS ai_threads(id TEXT PRIMARY KEY,org_id TEXT NOT NULL,user_id TEXT NOT NULL,title TEXT NOT NULL,entity TEXT NOT NULL DEFAULT '',record_id TEXT NOT NULL DEFAULT '',version INTEGER NOT NULL DEFAULT 0,busy_until TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`,
		`CREATE INDEX IF NOT EXISTS ai_threads_owner ON ai_threads(org_id,user_id,updated_at)`,
		`CREATE TABLE IF NOT EXISTS ai_messages(id TEXT PRIMARY KEY,thread_id TEXT NOT NULL REFERENCES ai_threads(id) ON DELETE CASCADE,role TEXT NOT NULL,content TEXT NOT NULL,sources TEXT NOT NULL DEFAULT '[]',actions TEXT NOT NULL DEFAULT '[]',dependencies TEXT NOT NULL DEFAULT '[]',created_at TEXT NOT NULL)`,
		`CREATE INDEX IF NOT EXISTS ai_messages_thread ON ai_messages(thread_id,created_at,id)`,
		`CREATE TABLE IF NOT EXISTS ai_actions(id TEXT PRIMARY KEY,org_id TEXT NOT NULL,user_id TEXT NOT NULL,thread_id TEXT NOT NULL DEFAULT '',kind TEXT NOT NULL,entity TEXT NOT NULL,record_id TEXT NOT NULL,payload TEXT NOT NULL,revision TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',result TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,expires_at TEXT NOT NULL)`,
		`CREATE INDEX IF NOT EXISTS ai_actions_owner ON ai_actions(org_id,user_id,created_at)`,
		`CREATE TABLE IF NOT EXISTS ai_usage(id TEXT PRIMARY KEY,org_id TEXT NOT NULL,user_id TEXT NOT NULL,kind TEXT NOT NULL,model TEXT NOT NULL,status TEXT NOT NULL,reserved_tokens INTEGER NOT NULL,charged_tokens INTEGER NOT NULL DEFAULT 0,input_tokens INTEGER NOT NULL DEFAULT 0,output_tokens INTEGER NOT NULL DEFAULT 0,reserved_usd REAL NOT NULL,estimated_usd REAL NOT NULL DEFAULT 0,details TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL,completed_at TEXT NOT NULL DEFAULT '')`,
		`CREATE INDEX IF NOT EXISTS ai_usage_daily ON ai_usage(org_id,created_at)`,
		`CREATE TABLE IF NOT EXISTS ai_knowledge(id TEXT PRIMARY KEY,org_id TEXT NOT NULL,scope_data TEXT NOT NULL,title TEXT NOT NULL,category TEXT NOT NULL,entity TEXT NOT NULL DEFAULT '',record_id TEXT NOT NULL DEFAULT '',filename TEXT NOT NULL DEFAULT '',content TEXT NOT NULL,updated_at TEXT NOT NULL)`,
		`CREATE TABLE IF NOT EXISTS ai_knowledge_chunks(id TEXT PRIMARY KEY,knowledge_id TEXT NOT NULL REFERENCES ai_knowledge(id) ON DELETE CASCADE,position INTEGER NOT NULL,content TEXT NOT NULL)`,
		`CREATE INDEX IF NOT EXISTS ai_knowledge_org ON ai_knowledge(org_id,updated_at)`,
		`CREATE TABLE IF NOT EXISTS ai_advice(org_id TEXT NOT NULL,user_id TEXT NOT NULL,day TEXT NOT NULL,status TEXT NOT NULL,reply TEXT NOT NULL DEFAULT '',sources TEXT NOT NULL DEFAULT '[]',dependencies TEXT NOT NULL DEFAULT '[]',updated_at TEXT NOT NULL,error TEXT NOT NULL DEFAULT '',PRIMARY KEY(org_id,user_id))`,
		`CREATE TABLE IF NOT EXISTS ai_voice(id TEXT PRIMARY KEY,org_id TEXT NOT NULL,user_id TEXT NOT NULL,call_id TEXT NOT NULL DEFAULT '',thread_id TEXT NOT NULL,usage_id TEXT NOT NULL,status TEXT NOT NULL,expires_at TEXT NOT NULL,created_at TEXT NOT NULL,version INTEGER NOT NULL,dependencies TEXT NOT NULL DEFAULT '[]',actions TEXT NOT NULL DEFAULT '[]',tool_count INTEGER NOT NULL DEFAULT 0,access_version TEXT NOT NULL)`,
	}
	for _, q := range statements {
		if _, err := tx.Exec(q); err != nil {
			return err
		}
	}
	return nil
}

type aiReservation struct {
	ID             string
	Settings       aiSettings
	ReservedTokens int
	ReservedUSD    float64
	Input, Output  int
	Uncertain      bool
	Details        map[string]any
}

// Each call reserves its maximum allowance before any provider traffic. A single
// SQLite transaction makes organization budgets safe under concurrent requests.
func reserveAI(r *http.Request, kind, model string, tokens int, cost float64) (*aiReservation, error) {
	settings := loadAISettings(r)
	if !settings.Enabled || os.Getenv("OPENAI_API_KEY") == "" || model == "" {
		return nil, fmt.Errorf("AI provider is not configured or workspace AI is disabled")
	}
	tx, err := database.BeginTx(r.Context(), nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()
	day := time.Now().UTC().Format("2006-01-02")
	var requests, usedTokens int
	var usedUSD float64
	err = tx.QueryRow(`SELECT count(*),coalesce(sum(CASE WHEN status='reserved' THEN reserved_tokens ELSE charged_tokens END),0),coalesce(sum(CASE WHEN status='reserved' THEN reserved_usd ELSE estimated_usd END),0) FROM ai_usage WHERE org_id=? AND created_at>=?`, currentUser(r).OrgID, day).Scan(&requests, &usedTokens, &usedUSD)
	if err != nil {
		return nil, err
	}
	if requests >= settings.DailyRequests || usedTokens+tokens > settings.DailyTokens || (settings.DailyBudgetUSD > 0 && usedUSD+cost > settings.DailyBudgetUSD) {
		return nil, fmt.Errorf("Workspace daily AI allowance reached. An administrator can review usage and limits")
	}
	id := newID("aiuse")
	if _, err = tx.Exec(`INSERT INTO ai_usage(id,org_id,user_id,kind,model,status,reserved_tokens,reserved_usd,created_at) VALUES(?,?,?,?,?,'reserved',?,?,?)`, id, currentUser(r).OrgID, currentUser(r).ID, kind, model, tokens, cost, utcNow()); err != nil {
		return nil, err
	}
	if err = tx.Commit(); err != nil {
		return nil, err
	}
	return &aiReservation{ID: id, Settings: settings, ReservedTokens: tokens, ReservedUSD: cost, Details: map[string]any{}}, nil
}
func (a *aiReservation) finish(status string) {
	tokens := a.Input + a.Output
	cost := float64(a.Input)*a.Settings.InputUSDPerMillion/1000000 + float64(a.Output)*a.Settings.OutputUSDPerMillion/1000000
	if a.Uncertain {
		tokens = a.ReservedTokens
		cost = a.ReservedUSD
		a.Details["usageIncomplete"] = true
	}
	if cost > a.ReservedUSD {
		a.Details["reservationExceeded"] = true
	}
	database.Exec(`UPDATE ai_usage SET status=?,charged_tokens=?,input_tokens=?,output_tokens=?,estimated_usd=?,details=?,completed_at=? WHERE id=? AND status='reserved'`, status, tokens, a.Input, a.Output, cost, mustJSON(a.Details), utcNow(), a.ID)
}
func handleAIAdministration(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	day := time.Now().UTC().Format("2006-01-02")
	summary, err := queryObjects(r, `SELECT count(*) AS requests,coalesce(sum(input_tokens),0) AS inputTokens,coalesce(sum(output_tokens),0) AS outputTokens,coalesce(sum(CASE WHEN status='reserved' THEN reserved_tokens ELSE charged_tokens END),0) AS allowanceTokens,coalesce(sum(CASE WHEN status='reserved' THEN reserved_usd ELSE estimated_usd END),0) AS estimatedUSD FROM ai_usage WHERE org_id=? AND created_at>=?`, currentUser(r).OrgID, day)
	if err != nil {
		writeError(w, 500, "Could not load AI usage")
		return
	}
	usage, err := queryObjects(r, `SELECT id,user_id AS userId,kind,model,status,input_tokens AS inputTokens,output_tokens AS outputTokens,estimated_usd AS estimatedUSD,details,created_at AS createdAt FROM ai_usage WHERE org_id=? ORDER BY created_at DESC LIMIT 100`, currentUser(r).OrgID)
	if err != nil {
		writeError(w, 500, "Could not load AI audit")
		return
	}
	writeJSON(w, 200, map[string]any{"settings": loadAISettings(r), "usage": usage, "today": summary, "budgetDay": day, "providerConfigured": os.Getenv("OPENAI_API_KEY") != "", "priceNotice": "Dollar totals are estimates using workspace-configured prices. Daily limits reset at midnight UTC. Failed requests with unknown provider usage keep their reserved allowance."})
}

// SQL-only assistant endpoints avoid holding the global CRM mutation lock while
// waiting for a model. Changes still require a normal serialized confirm route.
func independentAI(r *http.Request) bool {
	p := r.URL.Path
	return p == "/api/assistant/chat" || p == "/api/assistant/advice" || p == "/api/assistant/capabilities" || p == "/api/assistant/calendar" || strings.HasPrefix(p, "/api/assistant/threads") || strings.HasPrefix(p, "/api/assistant/knowledge") || strings.HasPrefix(p, "/api/assistant/voice") || p == "/api/admin/assistant" && r.Method == "GET"
}
func aiOrigin(w http.ResponseWriter, r *http.Request) bool {
	if r.Method != "GET" && !validOrigin(r) {
		writeError(w, 403, "Cross-origin changes are not allowed")
		return false
	}
	return true
}
func aiUserRequest(ctx context.Context, user User) *http.Request {
	return (&http.Request{Method: "GET", Header: make(http.Header)}).WithContext(context.WithValue(ctx, requestUserKey, user))
}
