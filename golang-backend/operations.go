package main

import (
	"log/slog"
	"net/http"
	"sync/atomic"
	"time"
)

var requestsTotal, requestsFailed, requestMilliseconds atomic.Int64
var startedAt = time.Now()

type observedResponse struct {
	http.ResponseWriter
	status int
}

func (w *observedResponse) WriteHeader(status int) {
	if w.status == 0 {
		w.status = status
		w.ResponseWriter.WriteHeader(status)
	}
}
func (w *observedResponse) Write(b []byte) (int, error) {
	if w.status == 0 {
		w.WriteHeader(200)
	}
	return w.ResponseWriter.Write(b)
}
func observeHTTP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		response := &observedResponse{ResponseWriter: w}
		next.ServeHTTP(response, r)
		elapsed := time.Since(start).Milliseconds()
		requestsTotal.Add(1)
		requestMilliseconds.Add(elapsed)
		if response.status >= 500 {
			requestsFailed.Add(1)
		}
		if r.Pattern != "" {
			slog.Info("http_request", "route", r.Pattern, "method", r.Method, "status", response.status, "duration_ms", elapsed)
		}
	})
}
func handleMetrics(w http.ResponseWriter, r *http.Request) {
	if !requireAdmin(w, r) {
		return
	}
	total := requestsTotal.Load()
	average := int64(0)
	if total > 0 {
		average = requestMilliseconds.Load() / total
	}
	writeJSON(w, 200, map[string]any{"requests": total, "serverErrors": requestsFailed.Load(), "averageMilliseconds": average, "uptimeSeconds": int(time.Since(startedAt).Seconds()), "database": database.Stats(), "mode": "single-writer cache with independent SQL report and record reads"})
}
