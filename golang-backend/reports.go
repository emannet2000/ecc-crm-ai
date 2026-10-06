package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
)

type reportSummary struct {
	PipelineLabel      string   `json:"pipelineLabel"`
	WonLabel           string   `json:"wonLabel"`
	BalanceLabel       string   `json:"balanceLabel"`
	ReportingCurrency  string   `json:"reportingCurrency"`
	MissingRates       []string `json:"missingRates"`
	Contacts           int      `json:"contacts"`
	Students           int      `json:"students"`
	Leads              int      `json:"leads"`
	ActiveCases        int      `json:"activeCases"`
	OpenTasks          int      `json:"openTasks"`
	PipelineValue      float64  `json:"pipelineValue"`
	WonValue           float64  `json:"wonValue"`
	OutstandingBalance float64  `json:"outstandingBalance"`
}

func handleReports(w http.ResponseWriter, r *http.Request) {
	mu.RLock()
	defer mu.RUnlock()
	pipeline, won, balance := map[string]float64{}, map[string]float64{}, map[string]float64{}
	report := reportSummary{Contacts: len(contacts), Students: len(students), Leads: len(leads)}
	for _, c := range cases {
		if c.CurrentStage != "Closed" && c.CurrentStage != "Approved" && c.CurrentStage != "Refused" {
			report.ActiveCases++
		}
	}
	for _, task := range tasks {
		if task.Status != "done" {
			report.OpenTasks++
		}
	}
	for _, deal := range deals {
		if deal.Stage == "Won" {
			won[currencyOf(deal.Currency)] += deal.Value
		} else if deal.Stage != "Lost" {
			pipeline[currencyOf(deal.Currency)] += deal.Value
		}
	}
	for _, invoice := range invoices {
		if invoice.Balance > 0 {
			balance[currencyOf(invoice.Currency)] += invoice.Balance
		}
	}
	target := "USD"
	storeDB(r).QueryRow("SELECT currency FROM organizations WHERE id=?", currentUser(r).OrgID).Scan(&target)
	rates := map[string]float64{target: 1}
	rows, err := storeDB(r).Query("SELECT data FROM workspace_entries WHERE org_id=? AND category='exchange_rate' ORDER BY json_extract(data,'$.asOf') DESC", currentUser(r).OrgID)
	if err == nil {
		for rows.Next() {
			var payload string
			rows.Scan(&payload)
			var rate struct {
				From, To, AsOf string
				Rate           float64
			}
			json.Unmarshal([]byte(payload), &rate)
			if rate.To == target && rate.Rate > 0 {
				if _, found := rates[rate.From]; !found {
					rates[rate.From] = rate.Rate
				}
			}
		}
		rows.Close()
	}
	missing := map[string]bool{}
	convert := func(values map[string]float64) (float64, string) {
		total := 0.0
		complete := true
		parts := []string{}
		keys := []string{}
		for c := range values {
			keys = append(keys, c)
		}
		sort.Strings(keys)
		for _, c := range keys {
			v := values[c]
			parts = append(parts, fmt.Sprintf("%s %.2f", c, v))
			if rate, found := rates[c]; found {
				total += v * rate
			} else {
				missing[c] = true
				complete = false
			}
		}
		if complete {
			return money(total), fmt.Sprintf("%s %.2f", target, total)
		}
		return 0, strings.Join(parts, " · ")
	}
	report.PipelineValue, report.PipelineLabel = convert(pipeline)
	report.WonValue, report.WonLabel = convert(won)
	report.OutstandingBalance, report.BalanceLabel = convert(balance)
	report.ReportingCurrency = target
	report.MissingRates = []string{}
	for c := range missing {
		report.MissingRates = append(report.MissingRates, c)
	}
	sort.Strings(report.MissingRates)
	writeJSON(w, 200, report)
}
