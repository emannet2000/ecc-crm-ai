package main

import "sync"

// ---------- entities (response shapes) ----------

type User struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Role     string `json:"role"`
	Password string `json:"-"` // never serialized
}

type Lead struct {
	ID             int     `json:"leadId"`
	Number         string  `json:"leadNumber"`
	FullName       string  `json:"fullName"`
	Email          *string `json:"email"`
	Phone          *string `json:"phone"`
	Source         *string `json:"source"`
	ConsultantID   *int    `json:"consultantId"`
	ConsultantName *string `json:"consultantName"`
	Quality        *string `json:"quality"`
	Stage          string  `json:"stage"`
	Destination    *string `json:"destination"`
	Service        *string `json:"service"`
	Notes          *string `json:"notes"`
	LastContact    *string `json:"lastContact"`
	NextFollowup   *string `json:"nextFollowup"`
	CreatedAt      string  `json:"createdAt"`
	UpdatedAt      string  `json:"updatedAt"`
}

type Task struct {
	ID           int     `json:"id"`
	LeadID       int     `json:"leadId"`
	LeadName     *string `json:"leadName"`
	Title        string  `json:"title"`
	Description  *string `json:"description"`
	DueDate      *string `json:"dueDate"`
	Priority     string  `json:"priority"`
	Status       string  `json:"status"`
	AssignedTo   *int    `json:"assignedTo"`
	AssigneeName *string `json:"assigneeName"`
	CreatedAt    string  `json:"createdAt"`
}

type Activity struct {
	ID          int     `json:"id"`
	LeadID      int     `json:"leadId"`
	LeadName    *string `json:"leadName"`
	Kind        string  `json:"kind"`
	Description *string `json:"description"`
	Date        string  `json:"date"`
}

type Client struct {
	ID              int     `json:"id"`
	Number          string  `json:"number"`
	FullName        string  `json:"fullName"`
	Email           *string `json:"email"`
	Phone           *string `json:"phone"`
	CaseOfficerID   *int    `json:"caseOfficerId"`
	CaseOfficerName *string `json:"caseOfficerName"`
	CreatedAt       string  `json:"createdAt"`
}

type CaseRow struct {
	ID          int     `json:"id"`
	ClientID    int     `json:"clientId"`
	Category    *string `json:"category"`
	Destination *string `json:"destination"`
	Stage       string  `json:"stage"`
	Deadline    *string `json:"deadline"`
	CreatedAt   string  `json:"createdAt"`
}

// Note: the Elm decoder reads a field named "uploader" (not "uploaderName").
type Document struct {
	ID        int     `json:"id"`
	LeadID    *int    `json:"leadId"`
	ClientID  *int    `json:"clientId"`
	Filename  string  `json:"filename"`
	MimeType  string  `json:"mimeType"`
	Size      int     `json:"size"`
	Uploader  *string `json:"uploader"`
	CreatedAt string  `json:"createdAt"`
}

type AuditEntry struct {
	ID         int         `json:"id"`
	EntityType string      `json:"entityType"`
	EntityID   int         `json:"entityId"`
	EntityName *string     `json:"entityName"`
	Action     string      `json:"action"`
	Changes    interface{} `json:"changes"`
	ActorName  *string     `json:"actorName"`
	CreatedAt  string      `json:"createdAt"`
}

// ---------- composites ----------

type LeadDetail struct {
	Lead       Lead       `json:"lead"`
	Tasks      []Task     `json:"tasks"`
	Activities []Activity `json:"activities"`
	Documents  []Document `json:"documents"`
}

type ClientDetail struct {
	Client    Client    `json:"client"`
	Cases     []CaseRow `json:"cases"`
	Documents []Document `json:"documents"`
}

// ---------- stats (weird prefixed names, per Types.elm) ----------

type StageCount struct {
	Stage string `json:"scStage"`
	Count int    `json:"scCount"`
}

type SourceCount struct {
	Source string `json:"srcSource"`
	Count  int    `json:"srcCount"`
}

type Stats struct {
	TotalLeads     int           `json:"stTotalLeads"`
	HotLeads       int           `json:"stHotLeads"`
	TotalClients   int           `json:"stTotalClients"`
	OpenTasks      int           `json:"stOpenTasks"`
	OverdueTasks   int           `json:"stOverdueTasks"`
	StageCounts    []StageCount  `json:"stStageCounts"`
	SourceCounts   []SourceCount `json:"stSourceCounts"`
	UpcomingTasks  []Task        `json:"stUpcomingTasks"`
	RecentActivity []Activity    `json:"stRecentActivity"`
}

// ---------- request bodies (mirror Elm encoders) ----------

type LoginBody struct {
	Email    string `json:"lrEmail"`
	Password string `json:"lrPassword"`
}

type NewLeadBody struct {
	FullName     string  `json:"nlFullName"`
	Email        *string `json:"nlEmail"`
	Phone        *string `json:"nlPhone"`
	Source       *string `json:"nlSource"`
	Quality      *string `json:"nlQuality"`
	Stage        *string `json:"nlStage"`
	Destination  *string `json:"nlDestination"`
	Service      *string `json:"nlService"`
	Notes        *string `json:"nlNotes"`
	NextFollowup *string `json:"nlNextFollowup"`
	ConsultantID *int    `json:"nlConsultantId"`
}

type UpdateLeadBody struct {
	FullName     *string `json:"ulFullName"`
	Email        *string `json:"ulEmail"`
	Phone        *string `json:"ulPhone"`
	Source       *string `json:"ulSource"`
	Quality      *string `json:"ulQuality"`
	Stage        *string `json:"ulStage"`
	Destination  *string `json:"ulDestination"`
	Service      *string `json:"ulService"`
	Notes        *string `json:"ulNotes"`
	LastContact  *string `json:"ulLastContact"`
	NextFollowup *string `json:"ulNextFollowup"`
	ConsultantID *int    `json:"ulConsultantId"`
}

type NoteBody struct {
	Note string `json:"nrNote"`
}

type NewTaskBody struct {
	LeadID      int     `json:"ntLeadId"`
	Title       string  `json:"ntTitle"`
	Description *string `json:"ntDescription"`
	DueDate     *string `json:"ntDueDate"`
	Priority    *string `json:"ntPriority"`
}

type TaskStatusBody struct {
	Status string `json:"tsrStatus"`
}

type NewClientBody struct {
	FullName    string  `json:"ncFullName"`
	Email       *string `json:"ncEmail"`
	Phone       *string `json:"ncPhone"`
	CaseOfficer *int    `json:"ncCaseOfficer"`
}

type CaseInputBody struct {
	ServiceCategory *string `json:"ciServiceCategory"`
	Destination     *string `json:"ciDestination"`
	Stage           *string `json:"ciStage"`
	NextDeadline    *string `json:"ciNextDeadline"`
	CaseID          *int    `json:"ciCaseId"`
}

type BulkRequestBody struct {
	Op           string `json:"brOp"`
	IDs          []int  `json:"brIds"`
	ConsultantID *int   `json:"brConsultantId"`
}

type NewUserBody struct {
	Name     string `json:"nuName"`
	Email    string `json:"nuEmail"`
	Role     string `json:"nuRole"`
	Password string `json:"nuPassword"`
}

type UpdateUserBody struct {
	Name     string  `json:"uuName"`
	Role     string  `json:"uuRole"`
	Password *string `json:"uuPassword"`
}

type PasswordChangeBody struct {
	Current string `json:"pcCurrent"`
	New     string `json:"pcNew"`
}

// ---------- session store ----------

type SessionStore struct {
	mu     sync.RWMutex
	tokens map[string]int // token -> userID
}
