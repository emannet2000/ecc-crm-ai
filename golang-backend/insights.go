package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"sort"
	"time"
)

// A transaction gives each report one committed view, without frontend page limits.
func sqlWorkspace(r *http.Request) (diskStore, error) {
	var s diskStore
	for _, e := range entityTables {
		clause, args := scopeSQL(r, "data")
		rows, err := storeDB(r).Query("SELECT id,data FROM "+e+" WHERE "+clause, args...)
		if err != nil {
			return s, err
		}
		for rows.Next() {
			var id, data string
			if err = rows.Scan(&id, &data); err != nil {
				rows.Close()
				return s, err
			}
			if err = replaceSavedRecord(&s, e, id, data); err != nil {
				rows.Close()
				return s, err
			}
		}
		err = rows.Err()
		rows.Close()
		if err != nil {
			return s, err
		}
	}
	return projectedStore(s, currentUser(r)), nil
}

type conversionMetric struct {
	Source    string  `json:"source"`
	Leads     int     `json:"leads"`
	Converted int     `json:"converted"`
	Rate      float64 `json:"rate"`
}
type enrollmentMetric struct {
	School   string `json:"school"`
	Intake   string `json:"intake"`
	Students int    `json:"students"`
	Enrolled int    `json:"enrolled"`
}
type agentMetric struct {
	Agent    string `json:"agent"`
	Students int    `json:"students"`
	Enrolled int    `json:"enrolled"`
}
type stageMetric struct {
	Stage        string  `json:"stage"`
	Visits       int     `json:"visits"`
	Hours        float64 `json:"hours"`
	AverageHours float64 `json:"averageHours"`
}

func parseReportDates(w http.ResponseWriter, r *http.Request) (string, string, bool) {
	from, to := r.URL.Query().Get("from"), r.URL.Query().Get("to")
	for _, date := range []string{from, to} {
		if date != "" {
			if _, err := time.Parse("2006-01-02", date); err != nil {
				writeError(w, 400, "Dates must use YYYY-MM-DD")
				return "", "", false
			}
		}
	}
	if from != "" && to != "" && from > to {
		writeError(w, 400, "Start date must precede end date")
		return "", "", false
	}
	return from, to, true
}
func withinCohort(date, from, to string) bool {
	if len(date) > 10 {
		date = date[:10]
	}
	return (from == "" || date >= from) && (to == "" || date <= to)
}
func cohortMetrics(s diskStore, from, to string) ([]conversionMetric, []enrollmentMetric, []agentMetric) {
	sources := map[string]*conversionMetric{}
	schools := map[string]*enrollmentMetric{}
	agents := map[string]*agentMetric{}
	for _, l := range s.Leads {
		if !withinCohort(l.CreatedAt, from, to) {
			continue
		}
		key := l.Source
		if sources[key] == nil {
			sources[key] = &conversionMetric{Source: key}
		}
		sources[key].Leads++
		if l.Status == "Converted" {
			sources[key].Converted++
		}
	}
	for _, st := range s.Students {
		if !withinCohort(st.CreatedAt, from, to) {
			continue
		}
		intake := st.Intake
		if intake == "" {
			intake = "Unspecified"
		}
		school := st.SchoolName
		if school == "" {
			school = "Unassigned"
		}
		key := st.SchoolID + "\x00" + intake
		if schools[key] == nil {
			schools[key] = &enrollmentMetric{School: school, Intake: intake}
		}
		schools[key].Students++
		agentKey := st.AgentID
		name := st.AgentName
		if name == "" {
			name = "Unassigned"
		}
		if agents[agentKey] == nil {
			agents[agentKey] = &agentMetric{Agent: name}
		}
		agents[agentKey].Students++
		if st.ApplicationStage == "Enrolled" {
			schools[key].Enrolled++
			agents[agentKey].Enrolled++
		}
	}
	a, b, c := []conversionMetric{}, []enrollmentMetric{}, []agentMetric{}
	for _, x := range sources {
		x.Rate = money(float64(x.Converted) * 100 / float64(x.Leads))
		a = append(a, *x)
	}
	for _, x := range schools {
		b = append(b, *x)
	}
	for _, x := range agents {
		c = append(c, *x)
	}
	sort.Slice(a, func(i, j int) bool { return a[i].Source < a[j].Source })
	sort.Slice(b, func(i, j int) bool {
		if b[i].School == b[j].School {
			return b[i].Intake < b[j].Intake
		}
		return b[i].School < b[j].School
	})
	sort.Slice(c, func(i, j int) bool { return c[i].Agent < c[j].Agent })
	return a, b, c
}
func handleInsights(w http.ResponseWriter, r *http.Request) {
	from, to, ok := parseReportDates(w, r)
	if !ok {
		return
	}
	tx, err := database.BeginTx(r.Context(), &sql.TxOptions{ReadOnly: true})
	if err != nil {
		writeError(w, 503, "Database unavailable")
		return
	}
	defer tx.Rollback()
	r = r.WithContext(context.WithValue(r.Context(), requestTxKey, tx))
	s, err := sqlWorkspace(r)
	if err != nil {
		writeError(w, 500, "Could not load reporting records")
		return
	}
	sources, enrollment, agents := cohortMetrics(s, from, to)
	allowed := map[string]bool{}
	for _, c := range s.Cases {
		allowed[c.ID] = withinCohort(c.CreatedAt, from, to)
	}
	rows, err := storeDB(r).Query("SELECT case_id,stage,entered_at FROM case_stage_events WHERE org_id=? ORDER BY case_id,entered_at,id", currentUser(r).OrgID)
	if err != nil {
		writeError(w, 500, "Could not load stage history")
		return
	}
	type visit struct {
		stage string
		at    time.Time
	}
	visits := map[string][]visit{}
	for rows.Next() {
		var id, stage, at string
		if err = rows.Scan(&id, &stage, &at); err != nil {
			break
		}
		if allowed[id] {
			if date, e := time.Parse(time.RFC3339Nano, at); e == nil {
				visits[id] = append(visits[id], visit{stage, date})
			}
		}
	}
	if e := rows.Err(); err == nil {
		err = e
	}
	rows.Close()
	if err != nil {
		writeError(w, 500, "Could not read stage history")
		return
	}
	stages := map[string]*stageMetric{}
	now := time.Now()
	for _, vs := range visits {
		for i, v := range vs {
			if v.stage == "Deleted" {
				continue
			}
			end := now
			if i+1 < len(vs) {
				end = vs[i+1].at
			}
			if stages[v.stage] == nil {
				stages[v.stage] = &stageMetric{Stage: v.stage}
			}
			m := stages[v.stage]
			m.Visits++
			m.Hours += end.Sub(v.at).Hours()
		}
	}
	duration := []stageMetric{}
	for _, m := range stages {
		m.AverageHours = money(m.Hours / float64(m.Visits))
		m.Hours = money(m.Hours)
		duration = append(duration, *m)
	}
	sort.Slice(duration, func(i, j int) bool { return duration[i].Stage < duration[j].Stage })
	next := []map[string]any{}
	today := organizationToday(r)
	for _, c := range s.Cases {
		if c.NextDeadline != "" && c.NextDeadline <= today && c.CurrentStage != "Closed" && c.CurrentStage != "Approved" && c.CurrentStage != "Refused" {
			next = append(next, map[string]any{"record": c.CaseNumber, "action": c.NextAction, "deadline": c.NextDeadline, "url": "/cases/" + c.ID})
		}
	}
	for _, t := range s.Tasks {
		if t.Status != "done" && t.DueDate != "" && t.DueDate <= today {
			next = append(next, map[string]any{"record": t.Title, "action": "Complete task", "deadline": t.DueDate, "url": "/tasks"})
		}
	}
	sort.Slice(next, func(i, j int) bool { return fmtString(next[i]["deadline"]) < fmtString(next[j]["deadline"]) })
	writeJSON(w, 200, map[string]any{"sources": sources, "enrollment": enrollment, "agents": agents, "stages": duration, "nextActions": next, "from": from, "to": to, "cohort": "Lead and student creation dates; case creation dates for stage duration. Stage time is measured only from recorded transitions; current visits include elapsed time.", "totals": map[string]int{"contacts": len(s.Contacts), "deals": len(s.Deals), "students": len(s.Students), "cases": len(s.Cases)}})
}
func trackCaseStages(tx *sql.Tx, s diskStore) error {
	rows, err := tx.Query("SELECT id,data FROM cases")
	if err != nil {
		return err
	}
	old := map[string]string{}
	for rows.Next() {
		var id, payload string
		if err = rows.Scan(&id, &payload); err != nil {
			rows.Close()
			return err
		}
		var c Case
		if err = json.Unmarshal([]byte(payload), &c); err != nil {
			rows.Close()
			return err
		}
		old[id] = c.CurrentStage
	}
	err = rows.Err()
	rows.Close()
	if err != nil {
		return err
	}
	for _, c := range s.Cases {
		var count int
		if old[c.ID] == c.CurrentStage {
			if err = tx.QueryRow("SELECT count(*) FROM case_stage_events WHERE case_id=?", c.ID).Scan(&count); err != nil {
				return err
			}
			if count > 0 {
				continue
			}
		}
		if _, err = tx.Exec("INSERT INTO case_stage_events VALUES(?,?,?,?,?)", newID("stage"), c.OrgID, c.ID, c.CurrentStage, time.Now().UTC().Format(time.RFC3339Nano)); err != nil {
			return err
		}
	}
	return nil
}
