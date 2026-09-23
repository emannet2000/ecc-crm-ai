package main

import (
	"crypto/rand"
	"encoding/hex"
	"sort"
	"strings"
	"sync"
	"time"
)

type Store struct {
	mu sync.RWMutex

	users       map[int]*User
	usersByMail map[string]*User

	leads   map[int]*Lead
	clients map[int]*Client
	cases   map[int]*CaseRow
	tasks   map[int]*Task
	acts    map[int]*Activity
	docs    map[int]*Document
	audit   []*AuditEntry

	nextUserID   int
	nextLeadID   int
	nextClientID int
	nextCaseID   int
	nextTaskID   int
	nextActID    int
	nextDocID    int
	nextAuditID  int

	nextLeadNo   int
	nextClientNo int
}

func NewStore() *Store {
	return &Store{
		users:       make(map[int]*User),
		usersByMail: make(map[string]*User),
		leads:       make(map[int]*Lead),
		clients:     make(map[int]*Client),
		cases:       make(map[int]*CaseRow),
		tasks:       make(map[int]*Task),
		acts:        make(map[int]*Activity),
		docs:        make(map[int]*Document),
		nextLeadNo:  1001,
		nextClientNo: 5001,
	}
}

// ---------- helpers ----------

func nowISO() string { return time.Now().UTC().Format(time.RFC3339) }

func strPtr(s string) *string { return &s }
func intPtr(i int) *int       { return &i }

func derefStr(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}

func derefInt(p *int) int {
	if p == nil {
		return 0
	}
	return *p
}

// ---------- session ----------

func NewSessionStore() *SessionStore {
	return &SessionStore{tokens: make(map[string]int)}
}

func (s *SessionStore) New(userID int) string {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	tok := hex.EncodeToString(b)
	s.mu.Lock()
	s.tokens[tok] = userID
	s.mu.Unlock()
	return tok
}

func (s *SessionStore) UserID(tok string) (int, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	uid, ok := s.tokens[tok]
	return uid, ok
}

func (s *SessionStore) Drop(tok string) {
	s.mu.Lock()
	delete(s.tokens, tok)
	s.mu.Unlock()
}

// ---------- audit ----------

func (st *Store) appendAudit(actor *User, entity string, id int, name *string, action string, changes interface{}) {
	st.nextAuditID++
	st.audit = append(st.audit, &AuditEntry{
		ID:         st.nextAuditID,
		EntityType: entity,
		EntityID:   id,
		EntityName: name,
		Action:     action,
		Changes:    changes,
		ActorName:  actorNamePtr(actor),
		CreatedAt:  nowISO(),
	})
}

func actorNamePtr(u *User) *string {
	if u == nil {
		return nil
	}
	return &u.Name
}

// ---------- user lookups ----------

func (st *Store) userByEmail(email string) *User {
	st.mu.RLock()
	defer st.mu.RUnlock()
	return st.usersByMail[strings.ToLower(email)]
}

func (st *Store) userByID(id int) *User {
	st.mu.RLock()
	defer st.mu.RUnlock()
	return st.users[id]
}

func (st *Store) userName(id *int) *string {
	if id == nil {
		return nil
	}
	st.mu.RLock()
	defer st.mu.RUnlock()
	if u, ok := st.users[*id]; ok {
		return &u.Name
	}
	return nil
}

// ---------- leads list/detail ----------

func (st *Store) listLeads() []Lead {
	st.mu.RLock()
	defer st.mu.RUnlock()
	out := make([]Lead, 0, len(st.leads))
	for _, l := range st.leads {
		out = append(out, *l)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID > out[j].ID })
	return out
}

func (st *Store) leadDetail(id int) (*LeadDetail, bool) {
	st.mu.RLock()
	defer st.mu.RUnlock()
	l, ok := st.leads[id]
	if !ok {
		return nil, false
	}
	det := &LeadDetail{
		Lead:       *l,
		Tasks:      []Task{},
		Activities: []Activity{},
		Documents:  []Document{},
	}
	for _, t := range st.tasks {
		if t.LeadID == id {
			det.Tasks = append(det.Tasks, *t)
		}
	}
	for _, a := range st.acts {
		if a.LeadID == id {
			det.Activities = append(det.Activities, *a)
		}
	}
	for _, d := range st.docs {
		if d.LeadID != nil && *d.LeadID == id {
			det.Documents = append(det.Documents, *d)
		}
	}
	sort.Slice(det.Activities, func(i, j int) bool { return det.Activities[i].Date > det.Activities[j].Date })
	return det, true
}

// ---------- clients / cases ----------

func (st *Store) listClients() []Client {
	st.mu.RLock()
	defer st.mu.RUnlock()
	out := make([]Client, 0, len(st.clients))
	for _, c := range st.clients {
		out = append(out, *c)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID > out[j].ID })
	return out
}

func (st *Store) clientDetail(id int) (*ClientDetail, bool) {
	st.mu.RLock()
	defer st.mu.RUnlock()
	c, ok := st.clients[id]
	if !ok {
		return nil, false
	}
	det := &ClientDetail{Client: *c, Cases: []CaseRow{}, Documents: []Document{}}
	for _, cs := range st.cases {
		if cs.ClientID == id {
			det.Cases = append(det.Cases, *cs)
		}
	}
	for _, d := range st.docs {
		if d.ClientID != nil && *d.ClientID == id {
			det.Documents = append(det.Documents, *d)
		}
	}
	return det, true
}

// ---------- tasks ----------

func (st *Store) listTasks() []Task {
	st.mu.RLock()
	defer st.mu.RUnlock()
	out := make([]Task, 0, len(st.tasks))
	for _, t := range st.tasks {
		out = append(out, *t)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID > out[j].ID })
	return out
}

// ---------- stats ----------

func (st *Store) stats() Stats {
	st.mu.RLock()
	defer st.mu.RUnlock()

	s := Stats{
		StageCounts:    []StageCount{},
		SourceCounts:   []SourceCount{},
		UpcomingTasks:  []Task{},
		RecentActivity: []Activity{},
	}

	stageMap := map[string]int{}
	srcMap := map[string]int{}

	for _, l := range st.leads {
		s.TotalLeads++
		if l.Quality != nil && strings.EqualFold(*l.Quality, "Hot") {
			s.HotLeads++
		}
		stageMap[l.Stage]++
		if l.Source != nil {
			srcMap[*l.Source]++
		}
	}

	s.TotalClients = len(st.clients)

	today := time.Now().UTC().Format("2006-01-02")
	for _, t := range st.tasks {
		if t.Status != "Done" {
			s.OpenTasks++
			if t.DueDate != nil && *t.DueDate < today {
				s.OverdueTasks++
			}
		}
	}

	for stage, n := range stageMap {
		s.StageCounts = append(s.StageCounts, StageCount{Stage: stage, Count: n})
	}
	for src, n := range srcMap {
		s.SourceCounts = append(s.SourceCounts, SourceCount{Source: src, Count: n})
	}
	sort.Slice(s.StageCounts, func(i, j int) bool { return s.StageCounts[i].Count > s.StageCounts[j].Count })
	sort.Slice(s.SourceCounts, func(i, j int) bool { return s.SourceCounts[i].Count > s.SourceCounts[j].Count })

	// upcoming tasks: not done, sorted by dueDate asc, top 5
	upcoming := []Task{}
	for _, t := range st.tasks {
		if t.Status != "Done" {
			upcoming = append(upcoming, *t)
		}
	}
	sort.Slice(upcoming, func(i, j int) bool {
		di, dj := derefStr(upcoming[i].DueDate), derefStr(upcoming[j].DueDate)
		if di == "" {
			di = "9999"
		}
		if dj == "" {
			dj = "9999"
		}
		return di < dj
	})
	if len(upcoming) > 5 {
		upcoming = upcoming[:5]
	}
	s.UpcomingTasks = upcoming

	// recent activities: latest 8
	acts := []Activity{}
	for _, a := range st.acts {
		acts = append(acts, *a)
	}
	sort.Slice(acts, func(i, j int) bool { return acts[i].Date > acts[j].Date })
	if len(acts) > 8 {
		acts = acts[:8]
	}
	s.RecentActivity = acts

	return s
}

// ---------- audit list ----------

func (st *Store) auditList(limit int) []AuditEntry {
	st.mu.RLock()
	defer st.mu.RUnlock()
	if limit <= 0 || limit > len(st.audit) {
		limit = len(st.audit)
	}
	out := make([]AuditEntry, 0, limit)
	for i := len(st.audit) - 1; i >= 0 && len(out) < limit; i-- {
		out = append(out, *st.audit[i])
	}
	return out
}
