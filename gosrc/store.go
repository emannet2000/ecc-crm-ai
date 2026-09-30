package main

import (
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"
)


var (
	mu         sync.RWMutex
	users      = map[string]User{}
	contacts   = []Contact{}
	deals      = []Deal{}
	activities = []Activity{}
	tasks      = []Task{}
	schools    = []School{}
	students   = []Student{}
	agents     = []Agent{}
	leads      = []Lead{}
	cases      = []Case{}
	documents  = []Document{}
	invoices   = []Invoice{}
	payments   = []Payment{}
	partners   = []Partner{}
)


func newID(prefix string) string {
	return fmt.Sprintf("%s_%d", prefix, time.Now().UnixNano())
}


func parseLimitOffset(r *http.Request, defaultLimit, defaultOffset int) (limit, offset int) {
	limit, offset = defaultLimit, defaultOffset
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			limit = n
		}
	}
	if limit > 200 {
		limit = 200
	}
	if v := r.URL.Query().Get("offset"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			offset = n
		}
	}
	return
}


func slicePage[T any](items []T, offset, limit int) []T {
	if offset >= len(items) {
		return []T{}
	}
	end := offset + limit
	if end > len(items) {
		end = len(items)
	}
	return items[offset:end]
}


func seedData() {
	seedUsers()
	seedContacts()

	seedDeals()
	seedActivities()
	seedTasks()
	seedSchools()
	seedStudents()
	seedAgents()
	seedLeads()
	seedCases()
	seedDocuments()
	seedFinance()
	seedPartners()
}
