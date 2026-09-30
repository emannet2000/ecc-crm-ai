package main

import (
	"log"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type invoiceRequest struct {
	InvoiceNumber         string  `json:"invoiceNumber"`
	ClientID              string  `json:"clientId"`
	CaseID                string  `json:"caseId"`
	TotalFee              float64 `json:"totalFee"`
	GovernmentFee         float64 `json:"governmentFee"`
	SchoolPartnerFee      float64 `json:"schoolPartnerFee"`
	AmountReceived        float64 `json:"amountReceived"`
	PaymentMilestone      string  `json:"paymentMilestone"`
	PaymentMethod         string  `json:"paymentMethod"`
	OfficialReceiptNumber string  `json:"officialReceiptNumber"`
	RefundStatus          string  `json:"refundStatus"`
	ReferralCommission    float64 `json:"referralCommission"`
	PartnerPayable        float64 `json:"partnerPayable"`
	PaymentApproval       string  `json:"paymentApproval"`
	Notes                 string  `json:"notes"`
}

type paymentRequest struct {
	InvoiceID string  `json:"invoiceId"`
	Amount    float64 `json:"amount"`
	PaidOn    string  `json:"paidOn"`
	Method    string  `json:"method"`
	Reference string  `json:"reference"`
	Notes     string  `json:"notes"`
}

type refundRequest struct {
	Reason string `json:"reason"`
}

var validPaymentMilestones = []string{
	"Quotation Issued", "Deposit Due", "Deposit Paid",
	"Instalment Due", "Fully Paid", "Refund Review", "Refunded",
}

func isValidPaymentMilestone(s string) bool {
	for _, v := range validPaymentMilestones {
		if v == s {
			return true
		}
	}
	return false
}

// validateInvoice must be called with mu held.
func validateInvoice(req invoiceRequest) map[string]string {
	fields := map[string]string{}

	clientID := strings.TrimSpace(req.ClientID)
	milestone := strings.TrimSpace(req.PaymentMilestone)

	if clientID == "" {
		fields["clientId"] = "Client is required"
	} else if _, ok := findContactByID(clientID); !ok {
		fields["clientId"] = "Client not found"
	}

	if req.TotalFee < 0 {
		fields["totalFee"] = "Total fee can't be negative"
	}
	if req.GovernmentFee < 0 {
		fields["governmentFee"] = "Government fee can't be negative"
	}
	if req.SchoolPartnerFee < 0 {
		fields["schoolPartnerFee"] = "Partner fee can't be negative"
	}
	if req.AmountReceived < 0 {
		fields["amountReceived"] = "Amount received can't be negative"
	}

	if milestone == "" {
		fields["paymentMilestone"] = "Payment milestone is required"
	} else if !isValidPaymentMilestone(milestone) {
		fields["paymentMilestone"] = "Invalid milestone"
	}

	return fields
}

// ================= INVOICES =================

func listInvoicesHandler(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	clientID := strings.TrimSpace(r.URL.Query().Get("clientId"))
	milestone := strings.TrimSpace(r.URL.Query().Get("milestone"))
	limit, offset := parseLimitOffset(r, 50, 0)

	all := listInvoices()
	filtered := make([]Invoice, 0, len(all))
	for _, inv := range all {
		if clientID != "" && inv.ClientID != clientID {
			continue
		}
		if milestone != "" && inv.PaymentMilestone != milestone {
			continue
		}
		if q == "" ||
			strings.Contains(strings.ToLower(inv.InvoiceNumber), q) ||
			strings.Contains(strings.ToLower(inv.ClientName), q) ||
			strings.Contains(strings.ToLower(inv.CaseNumber), q) {
			filtered = append(filtered, inv)
		}
	}
	total := len(filtered)
	writeJSON(w, http.StatusOK, map[string]any{
		"invoices": slicePage(filtered, offset, limit),
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}

func getInvoiceHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	mu.RLock()
	defer mu.RUnlock()
	for _, inv := range invoices {
		if inv.ID == id {
			writeJSON(w, http.StatusOK, map[string]any{"invoice": inv})
			return
		}
	}
	writeError(w, http.StatusNotFound, "Invoice not found")
}

func createInvoiceHandler(w http.ResponseWriter, r *http.Request) {
	var req invoiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	email, _ := r.Context().Value(ctxUserEmail).(string)
	createdBy := "Unknown"
	if email != "" {
		if u, ok := findUserByEmail(email); ok {
			createdBy = u.Name
		}
	}

	mu.Lock()
	defer mu.Unlock()

	if fields := validateInvoice(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	clientID := strings.TrimSpace(req.ClientID)
	clientName := ""
	if c, ok := findContactByID(clientID); ok {
		clientName = c.Name
	}

	caseID := strings.TrimSpace(req.CaseID)
	caseNumber := ""
	if c, ok := findCaseByID(caseID); ok {
		caseNumber = c.CaseNumber
	}

	now := time.Now().Format("2006-01-02")
	invNumber := strings.TrimSpace(req.InvoiceNumber)
	if invNumber == "" {
		invNumber = fmt.Sprintf("ECC-INV-%d-%05d",
			time.Now().Year(), time.Now().UnixNano()%100000)
	}

	totalDue := req.TotalFee + req.GovernmentFee + req.SchoolPartnerFee
	balance := totalDue - req.AmountReceived

	newInv := Invoice{
		ID:                    newID("inv"),
		InvoiceNumber:         invNumber,
		ClientID:              clientID,
		ClientName:            clientName,
		CaseID:                caseID,
		CaseNumber:            caseNumber,
		TotalFee:              req.TotalFee,
		GovernmentFee:         req.GovernmentFee,
		SchoolPartnerFee:      req.SchoolPartnerFee,
		AmountReceived:        req.AmountReceived,
		Balance:               balance,
		PaymentMilestone:      strings.TrimSpace(req.PaymentMilestone),
		PaymentMethod:         strings.TrimSpace(req.PaymentMethod),
		OfficialReceiptNumber: strings.TrimSpace(req.OfficialReceiptNumber),
		RefundStatus:          strings.TrimSpace(req.RefundStatus),
		ReferralCommission:    req.ReferralCommission,
		PartnerPayable:        req.PartnerPayable,
		PaymentApproval:       strings.TrimSpace(req.PaymentApproval),
		Notes:                 req.Notes,
		CreatedBy:             createdBy,
		CreatedAt:             now,
	}

	invoices = append(invoices, newInv)
	writeJSON(w, http.StatusCreated, map[string]any{"invoice": newInv})
}

func updateInvoiceHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req invoiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, inv := range invoices {
		if inv.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Invoice not found")
		return
	}

	if fields := validateInvoice(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	clientID := strings.TrimSpace(req.ClientID)
	clientName := ""
	if c, ok := findContactByID(clientID); ok {
		clientName = c.Name
	}

	caseID := strings.TrimSpace(req.CaseID)
	caseNumber := ""
	if c, ok := findCaseByID(caseID); ok {
		caseNumber = c.CaseNumber
	}

	totalDue := req.TotalFee + req.GovernmentFee + req.SchoolPartnerFee
	balance := totalDue - req.AmountReceived

	updated := invoices[idx]
	updated.InvoiceNumber = strings.TrimSpace(req.InvoiceNumber)
	updated.ClientID = clientID
	updated.ClientName = clientName
	updated.CaseID = caseID
	updated.CaseNumber = caseNumber
	updated.TotalFee = req.TotalFee
	updated.GovernmentFee = req.GovernmentFee
	updated.SchoolPartnerFee = req.SchoolPartnerFee
	updated.AmountReceived = req.AmountReceived
	updated.Balance = balance
	updated.PaymentMilestone = strings.TrimSpace(req.PaymentMilestone)
	updated.PaymentMethod = strings.TrimSpace(req.PaymentMethod)
	updated.OfficialReceiptNumber = strings.TrimSpace(req.OfficialReceiptNumber)
	updated.RefundStatus = strings.TrimSpace(req.RefundStatus)
	updated.ReferralCommission = req.ReferralCommission
	updated.PartnerPayable = req.PartnerPayable
	updated.PaymentApproval = strings.TrimSpace(req.PaymentApproval)
	updated.Notes = req.Notes

	invoices[idx] = updated
	writeJSON(w, http.StatusOK, map[string]any{"invoice": updated})
}

func requestRefundHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req refundRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	reason := strings.TrimSpace(req.Reason)
	if reason == "" {
		writeFieldErrors(w, map[string]string{"reason": "Reason is required"})
		return
	}

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, inv := range invoices {
		if inv.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Invoice not found")
		return
	}

	invoices[idx].RefundStatus = "Requested"
	invoices[idx].PaymentMilestone = "Refund Review"
	invoices[idx].Notes = invoices[idx].Notes + "\n[Refund requested] " + reason

	writeJSON(w, http.StatusOK, map[string]any{"invoice": invoices[idx]})
}

func deleteInvoiceHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, inv := range invoices {
		if inv.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Invoice not found")
		return
	}

	invoices = append(invoices[:idx], invoices[idx+1:]...)
	writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}

// ================= PAYMENTS =================

func listPaymentsHandler(w http.ResponseWriter, r *http.Request) {
	invoiceID := strings.TrimSpace(r.URL.Query().Get("invoiceId"))
	limit, offset := parseLimitOffset(r, 50, 0)

	all := listPayments()
	filtered := make([]Payment, 0, len(all))
	for _, p := range all {
		if invoiceID != "" && p.InvoiceID != invoiceID {
			continue
		}
		filtered = append(filtered, p)
	}
	total := len(filtered)
	writeJSON(w, http.StatusOK, map[string]any{
		"payments": slicePage(filtered, offset, limit),
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}

func createPaymentHandler(w http.ResponseWriter, r *http.Request) {
	var req paymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	email, _ := r.Context().Value(ctxUserEmail).(string)
	createdBy := "Unknown"
	if email != "" {
		if u, ok := findUserByEmail(email); ok {
			createdBy = u.Name
		}
	}

	mu.Lock()
	defer mu.Unlock()

	invoiceID := strings.TrimSpace(req.InvoiceID)
	if invoiceID == "" {
		writeFieldErrors(w, map[string]string{"invoiceId": "Invoice is required"})
		return
	}

	invIdx := -1
	for i, inv := range invoices {
		if inv.ID == invoiceID {
			invIdx = i
			break
		}
	}
	if invIdx == -1 {
		writeFieldErrors(w, map[string]string{"invoiceId": "Invoice not found"})
		return
	}

	if req.Amount <= 0 {
		writeFieldErrors(w, map[string]string{"amount": "Amount must be positive"})
		return
	}

	now := time.Now().Format("2006-01-02")
	newPayment := Payment{
		ID:        newID("pay"),
		InvoiceID: invoiceID,
		Amount:    req.Amount,
		PaidOn:    normalizeDate(req.PaidOn),
		Method:    strings.TrimSpace(req.Method),
		Reference: strings.TrimSpace(req.Reference),
		Notes:     req.Notes,
		CreatedBy: createdBy,
		CreatedAt: now,
	}

	payments = append(payments, newPayment)

	inv := invoices[invIdx]
	inv.AmountReceived = inv.AmountReceived + req.Amount
	totalDue := inv.TotalFee + inv.GovernmentFee + inv.SchoolPartnerFee
	inv.Balance = totalDue - inv.AmountReceived
	if inv.Balance <= 0 {
		inv.PaymentMilestone = "Fully Paid"
	} else if inv.AmountReceived > 0 {
		inv.PaymentMilestone = "Instalment Due"
	}
	invoices[invIdx] = inv

	writeJSON(w, http.StatusCreated, map[string]any{
		"payment": newPayment,
		"invoice": inv,
	})
}

func deletePaymentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, p := range payments {
		if p.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Payment not found")
		return
	}

	payments = append(payments[:idx], payments[idx+1:]...)
	writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}


// ---- seed data & in-memory accessors (moved from store.go) ----

func seedFinance() {
	invoices = []Invoice{
		{ID: "inv_1", InvoiceNumber: "ECC-INV-2026-00001",
			ClientID: "c_1", ClientName: "Ada Lovelace",
			CaseID: "case_1", CaseNumber: "ECC-CASE-2026-00001",
			TotalFee: 4500, GovernmentFee: 235, SchoolPartnerFee: 0,
			AmountReceived: 2500, Balance: 2235,
			PaymentMilestone: "Instalment Due", PaymentMethod: "Bank Transfer",
			OfficialReceiptNumber: "ECC-RCP-2026-00001",
			PaymentApproval:       "Demo User", Notes: "Deposit received.",
			CreatedBy: "Demo User", CreatedAt: "2026-06-15"},
		{ID: "inv_2", InvoiceNumber: "ECC-INV-2026-00002",
			ClientID: "c_2", ClientName: "Grace Hopper",
			CaseID: "case_2", CaseNumber: "ECC-CASE-2026-00002",
			TotalFee: 5500, GovernmentFee: 620, SchoolPartnerFee: 500,
			AmountReceived: 6620, Balance: 0,
			PaymentMilestone: "Fully Paid", PaymentMethod: "Bank Transfer",
			OfficialReceiptNumber: "ECC-RCP-2026-00002",
			ReferralCommission:    900, PartnerPayable: 500,
			PaymentApproval:       "Demo User", Notes: "Fully paid.",
			CreatedBy: "Demo User", CreatedAt: "2026-04-20"},
	}
	payments = []Payment{
		{ID: "pay_1", InvoiceID: "inv_1", Amount: 2500, PaidOn: "2026-06-20",
			Method: "Bank Transfer", Reference: "TRX-884421",
			Notes:     "Deposit.",
			CreatedBy: "Demo User", CreatedAt: "2026-06-20"},
		{ID: "pay_2", InvoiceID: "inv_2", Amount: 6620, PaidOn: "2026-04-25",
			Method: "Bank Transfer", Reference: "TRX-884422",
			Notes:     "Full payment.",
			CreatedBy: "Demo User", CreatedAt: "2026-04-25"},
	}
	log.Println("Seeded 2 invoices + 2 payments")
}

func listInvoices() []Invoice {
	mu.RLock()
	defer mu.RUnlock()
	out := make([]Invoice, len(invoices))
	copy(out, invoices)
	return out
}

func getInvoiceByID(id string) (Invoice, bool) {
	mu.RLock()
	defer mu.RUnlock()
	for _, inv := range invoices {
		if inv.ID == id {
			return inv, true
		}
	}
	return Invoice{}, false
}

// ================= PAYMENTS: ACCESSORS =================

func listPayments() []Payment {
	mu.RLock()
	defer mu.RUnlock()
	out := make([]Payment, len(payments))
	copy(out, payments)
	return out
}

// ================= PARTNERS: ACCESSORS =================
