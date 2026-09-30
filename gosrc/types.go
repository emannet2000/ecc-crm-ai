package main

type User struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"-"`
}

type Contact struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Email       string   `json:"email"`
	Company     string   `json:"company"`
	Title       string   `json:"title"`
	Phone       string   `json:"phone"`
	Location    string   `json:"location"`
	Stage       string   `json:"stage"`
	LastContact string   `json:"lastContact"`
	Owner       string   `json:"owner"`
	Tags        []string `json:"tags"`
	Notes       string   `json:"notes"`
	CreatedAt   string   `json:"createdAt"`
}

type Deal struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	ContactID   string  `json:"contactId"`
	ContactName string  `json:"contactName"`
	Value       float64 `json:"value"`
	Currency    string  `json:"currency"`
	Stage       string  `json:"stage"`
	CloseDate   string  `json:"closeDate"`
	Owner       string  `json:"owner"`
	Notes       string  `json:"notes"`
	CreatedAt   string  `json:"createdAt"`
}

type Activity struct {
	ID         string `json:"id"`
	ContactID  string `json:"contactId"`
	DealID     string `json:"dealId"`
	Kind       string `json:"kind"`
	Title      string `json:"title"`
	Body       string `json:"body"`
	OccurredAt string `json:"occurredAt"`
	CreatedBy  string `json:"createdBy"`
	CreatedAt  string `json:"createdAt"`
}

type Task struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	DueDate     string `json:"dueDate"`
	ContactID   string `json:"contactId"`
	ContactName string `json:"contactName"`
	Owner       string `json:"owner"`
	CreatedAt   string `json:"createdAt"`
}

type School struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	CountryCode      string `json:"countryCode"`
	CommissionRate   string `json:"commissionRate"`
	ContractStatus   string `json:"contractStatus"`
	StudentsEnrolled int    `json:"studentsEnrolled"`
	ContactPerson    string `json:"contactPerson"`
	Website          string `json:"website"`
	Notes            string `json:"notes"`
	CreatedBy        string `json:"createdBy"`
	CreatedAt        string `json:"createdAt"`
}

type Student struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	StudentCode      string `json:"studentCode"`
	CountryCode      string `json:"countryCode"`
	SchoolID         string `json:"schoolId"`
	SchoolName       string `json:"schoolName"`
	AgentID          string `json:"agentId"`
	AgentName        string `json:"agentName"`
	Program          string `json:"program"`
	AcceptanceStatus string `json:"acceptanceStatus"`
	VisaStatus       string `json:"visaStatus"`
	InvoiceStatus    string `json:"invoiceStatus"`
	Notes            string `json:"notes"`
	CreatedBy        string `json:"createdBy"`
	CreatedAt        string `json:"createdAt"`
}

type Agent struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	AgentCode        string `json:"agentCode"`
	CountryCode      string `json:"countryCode"`
	ContractStatus   string `json:"contractStatus"`
	AgentStatus      string `json:"agentStatus"`
	StudentsReferred int    `json:"studentsReferred"`
	Notes            string `json:"notes"`
	CreatedBy        string `json:"createdBy"`
	CreatedAt        string `json:"createdAt"`
}

type Lead struct {
	ID                string `json:"id"`
	LeadNumber        string `json:"leadNumber"`
	Name              string `json:"name"`
	Email             string `json:"email"`
	Phone             string `json:"phone"`
	Nationality       string `json:"nationality"`
	CurrentCountry    string `json:"currentCountry"`
	InterestedCountry string `json:"interestedCountry"`
	InterestedService string `json:"interestedService"`
	Source            string `json:"source"`
	AssignedTo        string `json:"assignedTo"`
	Status            string `json:"status"`
	FollowUpDate      string `json:"followUpDate"`
	Notes             string `json:"notes"`
	CreatedBy         string `json:"createdBy"`
	CreatedAt         string `json:"createdAt"`
}

type Case struct {
	ID                 string `json:"id"`
	CaseNumber         string `json:"caseNumber"`
	ClientID           string `json:"clientId"`
	ClientName         string `json:"clientName"`
	StudentID          string `json:"studentId"`
	StudentName        string `json:"studentName"`
	ServiceCategory    string `json:"serviceCategory"`
	DestinationCountry string `json:"destinationCountry"`
	VisaType           string `json:"visaType"`
	SchoolOrEmployer   string `json:"schoolOrEmployer"`
	AssignedOfficer    string `json:"assignedOfficer"`
	ExternalAdviser    string `json:"externalAdviser"`
	DateOpened         string `json:"dateOpened"`
	TargetSubmission   string `json:"targetSubmission"`
	ActualSubmission   string `json:"actualSubmission"`
	GovernmentRef      string `json:"governmentRef"`
	CurrentStage       string `json:"currentStage"`
	Priority           string `json:"priority"`
	NextAction         string `json:"nextAction"`
	NextDeadline       string `json:"nextDeadline"`
	Result             string `json:"result"`
	ClosureDate        string `json:"closureDate"`
	Notes              string `json:"notes"`
	CreatedBy          string `json:"createdBy"`
	CreatedAt          string `json:"createdAt"`
}

type Document struct {
	ID                   string `json:"id"`
	CaseID               string `json:"caseId"`
	CaseNumber           string `json:"caseNumber"`
	DocName              string `json:"docName"`
	Required             bool   `json:"required"`
	DateRequested        string `json:"dateRequested"`
	DateReceived         string `json:"dateReceived"`
	ExpiryDate           string `json:"expiryDate"`
	VerifiedBy           string `json:"verifiedBy"`
	VerificationDate     string `json:"verificationDate"`
	Status               string `json:"status"`
	RejectionReason      string `json:"rejectionReason"`
	LatestVersion        int    `json:"latestVersion"`
	TranslationRequired  bool   `json:"translationRequired"`
	LegalizationRequired bool   `json:"legalizationRequired"`
	FilePath             string `json:"filePath"`
	Notes                string `json:"notes"`
	CreatedBy            string `json:"createdBy"`
	CreatedAt            string `json:"createdAt"`
}

type Invoice struct {
	ID                    string  `json:"id"`
	InvoiceNumber         string  `json:"invoiceNumber"`
	ClientID              string  `json:"clientId"`
	ClientName            string  `json:"clientName"`
	CaseID                string  `json:"caseId"`
	CaseNumber            string  `json:"caseNumber"`
	TotalFee              float64 `json:"totalFee"`
	GovernmentFee         float64 `json:"governmentFee"`
	SchoolPartnerFee      float64 `json:"schoolPartnerFee"`
	AmountReceived        float64 `json:"amountReceived"`
	Balance               float64 `json:"balance"`
	PaymentMilestone      string  `json:"paymentMilestone"`
	PaymentMethod         string  `json:"paymentMethod"`
	OfficialReceiptNumber string  `json:"officialReceiptNumber"`
	RefundStatus          string  `json:"refundStatus"`
	ReferralCommission    float64 `json:"referralCommission"`
	PartnerPayable        float64 `json:"partnerPayable"`
	PaymentApproval       string  `json:"paymentApproval"`
	Notes                 string  `json:"notes"`
	CreatedBy             string  `json:"createdBy"`
	CreatedAt             string  `json:"createdAt"`
}

type Payment struct {
	ID        string  `json:"id"`
	InvoiceID string  `json:"invoiceId"`
	Amount    float64 `json:"amount"`
	PaidOn    string  `json:"paidOn"`
	Method    string  `json:"method"`
	Reference string  `json:"reference"`
	Notes     string  `json:"notes"`
	CreatedBy string  `json:"createdBy"`
	CreatedAt string  `json:"createdAt"`
}

type Partner struct {
	ID                  string  `json:"id"`
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
	CreatedBy           string  `json:"createdBy"`
	CreatedAt           string  `json:"createdAt"`
}
