package main

import (
	"log"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type partnerRequest struct {
	Type                string  `json:"type"`
	LegalCompanyName    string  `json:"legalCompanyName"`
	Country             string  `json:"country"`
	LicenseNumber       string  `json:"licenseNumber"`
	LicenseExpiry       string  `json:"licenseExpiry"`
	VerificationSource  string  `json:"verificationSource"`
	ContactPerson       string  `json:"contactPerson"`
	ContactEmail        string  `json:"contactEmail"`
	ContactPhone        string  `json:"contactPhone"`
	AgreementStart      string  `json:"agreementStart"`
	AgreementExpiry     string  `json:"agreementExpiry"`
	ServicesPermitted   string  `json:"servicesPermitted"`
	CommissionStructure string  `json:"commissionStructure"`
	PaymentTerms        string  `json:"paymentTerms"`
	CasesReferred       int     `json:"casesReferred"`
	CasesConverted      int     `json:"casesConverted"`
	AmountPayable       float64 `json:"amountPayable"`
	ComplianceNotes     string  `json:"complianceNotes"`
	Notes               string  `json:"notes"`
}

var validPartnerTypes = []string{
	"School", "Immigration Lawyer", "Licensed Consultant",
	"Recruitment Agency", "Employer", "Travel Agency",
	"Referral Agent", "Language Provider",
}

func isValidPartnerType(s string) bool {
	for _, v := range validPartnerTypes {
		if v == s {
			return true
		}
	}
	return false
}

func validatePartner(req partnerRequest) map[string]string {
	fields := map[string]string{}

	name := strings.TrimSpace(req.LegalCompanyName)
	ptype := strings.TrimSpace(req.Type)

	if name == "" {
		fields["legalCompanyName"] = "Legal company name is required"
	} else if len(name) > 200 {
		fields["legalCompanyName"] = "Name must be 200 characters or fewer"
	}

	if ptype == "" {
		fields["type"] = "Partner type is required"
	} else if !isValidPartnerType(ptype) {
		fields["type"] = "Invalid partner type"
	}

	if req.CasesReferred < 0 {
		fields["casesReferred"] = "Can't be negative"
	}
	if req.CasesConverted < 0 {
		fields["casesConverted"] = "Can't be negative"
	}
	if req.AmountPayable < 0 {
		fields["amountPayable"] = "Can't be negative"
	}

	return fields
}

func listPartnersHandler(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	ptype := strings.TrimSpace(r.URL.Query().Get("type"))
	country := strings.TrimSpace(strings.ToUpper(r.URL.Query().Get("country")))
	limit, offset := parseLimitOffset(r, 50, 0)

	all := listPartners()
	filtered := make([]Partner, 0, len(all))
	for _, p := range all {
		if ptype != "" && p.Type != ptype {
			continue
		}
		if country != "" && p.Country != country {
			continue
		}
		if q == "" ||
			strings.Contains(strings.ToLower(p.LegalCompanyName), q) ||
			strings.Contains(strings.ToLower(p.ContactPerson), q) ||
			strings.Contains(strings.ToLower(p.LicenseNumber), q) ||
			strings.Contains(strings.ToLower(p.ServicesPermitted), q) {
			filtered = append(filtered, p)
		}
	}
	total := len(filtered)
	writeJSON(w, http.StatusOK, map[string]any{
		"partners": slicePage(filtered, offset, limit),
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}

func getPartnerHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	mu.RLock()
	defer mu.RUnlock()
	for _, p := range partners {
		if p.ID == id {
			writeJSON(w, http.StatusOK, map[string]any{"partner": p})
			return
		}
	}
	writeError(w, http.StatusNotFound, "Partner not found")
}

func createPartnerHandler(w http.ResponseWriter, r *http.Request) {
	var req partnerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if fields := validatePartner(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	email, _ := r.Context().Value(ctxUserEmail).(string)
	createdBy := "Unknown"
	if email != "" {
		if u, ok := findUserByEmail(email); ok {
			createdBy = u.Name
		}
	}

	now := time.Now().Format("2006-01-02")
	newPartner := Partner{
		ID:                  newID("p"),
		Type:                strings.TrimSpace(req.Type),
		LegalCompanyName:    strings.TrimSpace(req.LegalCompanyName),
		Country:             strings.TrimSpace(strings.ToUpper(req.Country)),
		LicenseNumber:       strings.TrimSpace(req.LicenseNumber),
		LicenseExpiry:       strings.TrimSpace(req.LicenseExpiry),
		VerificationSource:  strings.TrimSpace(req.VerificationSource),
		ContactPerson:       strings.TrimSpace(req.ContactPerson),
		ContactEmail:        strings.TrimSpace(req.ContactEmail),
		ContactPhone:        strings.TrimSpace(req.ContactPhone),
		AgreementStart:      strings.TrimSpace(req.AgreementStart),
		AgreementExpiry:     strings.TrimSpace(req.AgreementExpiry),
		ServicesPermitted:   strings.TrimSpace(req.ServicesPermitted),
		CommissionStructure: strings.TrimSpace(req.CommissionStructure),
		PaymentTerms:        strings.TrimSpace(req.PaymentTerms),
		CasesReferred:       req.CasesReferred,
		CasesConverted:      req.CasesConverted,
		AmountPayable:       req.AmountPayable,
		ComplianceNotes:     strings.TrimSpace(req.ComplianceNotes),
		Notes:               req.Notes,
		CreatedBy:           createdBy,
		CreatedAt:           now,
	}

	mu.Lock()
	partners = append(partners, newPartner)
	mu.Unlock()

	writeJSON(w, http.StatusCreated, map[string]any{"partner": newPartner})
}

func updatePartnerHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req partnerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if fields := validatePartner(req); len(fields) > 0 {
		writeFieldErrors(w, fields)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, p := range partners {
		if p.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Partner not found")
		return
	}

	updated := partners[idx]
	updated.Type = strings.TrimSpace(req.Type)
	updated.LegalCompanyName = strings.TrimSpace(req.LegalCompanyName)
	updated.Country = strings.TrimSpace(strings.ToUpper(req.Country))
	updated.LicenseNumber = strings.TrimSpace(req.LicenseNumber)
	updated.LicenseExpiry = strings.TrimSpace(req.LicenseExpiry)
	updated.VerificationSource = strings.TrimSpace(req.VerificationSource)
	updated.ContactPerson = strings.TrimSpace(req.ContactPerson)
	updated.ContactEmail = strings.TrimSpace(req.ContactEmail)
	updated.ContactPhone = strings.TrimSpace(req.ContactPhone)
	updated.AgreementStart = strings.TrimSpace(req.AgreementStart)
	updated.AgreementExpiry = strings.TrimSpace(req.AgreementExpiry)
	updated.ServicesPermitted = strings.TrimSpace(req.ServicesPermitted)
	updated.CommissionStructure = strings.TrimSpace(req.CommissionStructure)
	updated.PaymentTerms = strings.TrimSpace(req.PaymentTerms)
	updated.CasesReferred = req.CasesReferred
	updated.CasesConverted = req.CasesConverted
	updated.AmountPayable = req.AmountPayable
	updated.ComplianceNotes = strings.TrimSpace(req.ComplianceNotes)
	updated.Notes = req.Notes

	partners[idx] = updated
	writeJSON(w, http.StatusOK, map[string]any{"partner": updated})
}

func deletePartnerHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	idx := -1
	for i, p := range partners {
		if p.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		writeError(w, http.StatusNotFound, "Partner not found")
		return
	}

	partners = append(partners[:idx], partners[idx+1:]...)
	writeJSON(w, http.StatusOK, map[string]any{"deleted": id})
}


// ---- seed data & in-memory accessors (moved from store.go) ----

func seedPartners() {
	partners = []Partner{
		{ID: "p_1", Type: "Immigration Lawyer",
			LegalCompanyName: "Al Farsi Legal Consultancy",
			Country:          "AE", LicenseNumber: "DXB-LAW-2024-0421",
			LicenseExpiry: "2027-03-31", VerificationSource: "Dubai Legal Affairs",
			ContactPerson: "Ahmed Al Farsi", ContactEmail: "ahmed@alfarsi.ae",
			ContactPhone:  "+971 4 555 0101",
			AgreementStart: "2025-04-01", AgreementExpiry: "2027-03-31",
			ServicesPermitted:   "Immigration consultation, visa review",
			CommissionStructure: "Flat fee per case", PaymentTerms: "Net 30",
			CasesReferred:       24, CasesConverted: 18, AmountPayable: 12000,
			ComplianceNotes: "License verified.",
			CreatedBy:       "Demo User", CreatedAt: "2025-04-01"},
		{ID: "p_2", Type: "Recruitment Agency",
			LegalCompanyName: "Gulf Talent Partners",
			Country:          "AE", LicenseNumber: "DXB-EMP-2023-1188",
			LicenseExpiry: "2026-12-31", VerificationSource: "MOHRE",
			ContactPerson: "Sarah Khalid", ContactEmail: "sarah@gulftalent.ae",
			ContactPhone:  "+971 4 555 0202",
			AgreementStart: "2024-01-15", AgreementExpiry: "2026-12-31",
			ServicesPermitted:   "Employer referrals",
			CommissionStructure: "10% of first-year salary", PaymentTerms: "Net 45",
			CasesReferred:       15, CasesConverted: 9, AmountPayable: 8500,
			ComplianceNotes: "License renewal due Dec 2026.",
			CreatedBy:       "Demo User", CreatedAt: "2024-01-15"},
		{ID: "p_3", Type: "Travel Agency",
			LegalCompanyName: "Emirates Travel Hub",
			Country:          "AE", LicenseNumber: "DXB-TRV-2025-0044",
			LicenseExpiry: "2028-06-30", VerificationSource: "DET",
			ContactPerson: "Rashid Al Marri", ContactEmail: "rashid@emtravel.ae",
			ContactPhone:  "+971 4 555 0303",
			AgreementStart: "2025-07-01", AgreementExpiry: "2028-06-30",
			ServicesPermitted:   "Flight booking, travel insurance",
			CommissionStructure: "Tiered", PaymentTerms: "Net 15",
			CasesReferred:       8, CasesConverted: 6, AmountPayable: 2400,
			CreatedBy: "Demo User", CreatedAt: "2025-07-01"},
	}
	log.Println("Seeded 3 partners")
}

func listPartners() []Partner {
	mu.RLock()
	defer mu.RUnlock()
	out := make([]Partner, len(partners))
	copy(out, partners)
	return out
}

func getPartnerByID(id string) (Partner, bool) {
	mu.RLock()
	defer mu.RUnlock()
	for _, p := range partners {
		if p.ID == id {
			return p, true
		}
	}
	return Partner{}, false
}
