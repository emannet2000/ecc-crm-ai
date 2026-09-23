package main

// Seed populates demo data matching the login hint shown in Views.elm:
//   password123 · admin@ecc.com · aya@ecc.com
func Seed(st *Store) {
	// --- users ---
	admin := st.addUser("admin@ecc.com", "Nadia Haddad", "admin", "password123")
	aya := st.addUser("aya@ecc.com", "Aya Karim", "consultant", "password123")
	_ = st.addUser("viewer@ecc.com", "Sam Reyes", "viewer", "password123")

	// --- leads ---
	l1 := st.addLead(&Lead{
		FullName:     "Omar Farouk",
		Email:        strPtr("omar@example.com"),
		Phone:        strPtr("+212600000001"),
		Source:       strPtr("Website"),
		Quality:      strPtr("Hot"),
		Stage:        "Qualified",
		Destination:  strPtr("Canada"),
		Service:      strPtr("Student Visa"),
		Notes:        strPtr("Interested in MSc CS, needs scholarship info."),
		ConsultantID: &aya.ID,
		NextFollowup: strPtr("2026-09-25"),
		LastContact:  strPtr("2026-09-15"),
	})
	l2 := st.addLead(&Lead{
		FullName:     "Lina Belkacem",
		Email:        strPtr("lina@example.com"),
		Phone:        strPtr("+212600000002"),
		Source:       strPtr("Instagram"),
		Quality:      strPtr("Warm"),
		Stage:        "Contacted",
		Destination:  strPtr("Australia"),
		Service:      strPtr("Work Visa"),
		ConsultantID: &admin.ID,
	})
	l3 := st.addLead(&Lead{
		FullName:    "Yusuf Rahal",
		Email:       strPtr("yusuf@example.com"),
		Source:      strPtr("Referral"),
		Quality:     strPtr("Cold"),
		Stage:       "New Lead",
		Destination: strPtr("UK"),
		Service:     strPtr("Tourist Visa"),
	})

	// --- notes/activities ---
	st.addActivity(l1.ID, "note", "Intro call booked for next Tuesday.")
	st.addActivity(l1.ID, "email", "Sent brochure + IELTS checklist.")
	st.addActivity(l2.ID, "call", "Discussed sponsorship options.")

	// --- tasks ---
	st.addTask(&Task{
		LeadID:      l1.ID,
		Title:       "Collect IELTS score",
		Description: strPtr("Ask Omar to upload his latest IELTS TRF."),
		DueDate:     strPtr("2026-09-21"),
		Priority:    "High",
		Status:      "Pending",
		AssignedTo:  &aya.ID,
	})
	st.addTask(&Task{
		LeadID:      l2.ID,
		Title:       "Prepare sponsorship checklist",
		DueDate:     strPtr("2026-09-19"),
		Priority:    "Medium",
		Status:      "In Progress",
		AssignedTo:  &admin.ID,
	})

	// --- a converted client ---
	c1 := st.addClient(&Client{
		FullName:      "Hassan Idrissi",
		Email:         strPtr("hassan@example.com"),
		Phone:         strPtr("+212600000010"),
		CaseOfficerID: &aya.ID,
	})
	_ = st.addCase(c1.ID, "Student Visa", "Canada", "Documents Under Review", "2026-10-15")
	_ = st.addCase(c1.ID, "Student Visa", "Canada", "Submitted", "2026-11-01")

	// --- documents (optional demo) ---
	st.addDocument(&Document{
		LeadID:    &l1.ID,
		Filename:  "transcript.pdf",
		MimeType:  "application/pdf",
		Size:      182334,
		Uploader:  &aya.Name,
	})

	_ = l3 // referenced to avoid unused
}

// ---------- store mutators used by seed ----------

func (st *Store) addUser(email, name, role, password string) *User {
	st.mu.Lock()
	defer st.mu.Unlock()
	st.nextUserID++
	u := &User{ID: st.nextUserID, Email: email, Name: name, Role: role, Password: password}
	st.users[u.ID] = u
	st.usersByMail[email] = u
	return u
}

func (st *Store) addLead(partial *Lead) *Lead {
	st.mu.Lock()
	defer st.mu.Unlock()
	st.nextLeadID++
	partial.ID = st.nextLeadID
	partial.Number = "L-" + itoaPad(st.nextLeadNo, 5)
	st.nextLeadNo++
	partial.CreatedAt = nowISO()
	partial.UpdatedAt = nowISO()
	if partial.ConsultantID != nil {
		partial.ConsultantName = st.userName(partial.ConsultantID)
	}
	st.leads[partial.ID] = partial
	st.appendAudit(nil, "lead", partial.ID, &partial.FullName, "created", nil)
	return partial
}

func (st *Store) addActivity(leadID int, kind, desc string) *Activity {
	st.mu.Lock()
	defer st.mu.Unlock()
	st.nextActID++
	a := &Activity{
		ID:          st.nextActID,
		LeadID:      leadID,
		Kind:        kind,
		Description: &desc,
		Date:        nowISO(),
	}
	if l, ok := st.leads[leadID]; ok {
		a.LeadName = &l.FullName
	}
	st.acts[a.ID] = a
	return a
}

func (st *Store) addTask(partial *Task) *Task {
	st.mu.Lock()
	defer st.mu.Unlock()
	st.nextTaskID++
	partial.ID = st.nextTaskID
	partial.CreatedAt = nowISO()
	if partial.Status == "" {
		partial.Status = "Pending"
	}
	if l, ok := st.leads[partial.LeadID]; ok {
		partial.LeadName = &l.FullName
	}
	if partial.AssignedTo != nil {
		partial.AssigneeName = st.userName(partial.AssignedTo)
	}
	st.tasks[partial.ID] = partial
	return partial
}

func (st *Store) addClient(partial *Client) *Client {
	st.mu.Lock()
	defer st.mu.Unlock()
	st.nextClientID++
	partial.ID = st.nextClientID
	partial.Number = "C-" + itoaPad(st.nextClientNo, 5)
	st.nextClientNo++
	partial.CreatedAt = nowISO()
	if partial.CaseOfficerID != nil {
		partial.CaseOfficerName = st.userName(partial.CaseOfficerID)
	}
	st.clients[partial.ID] = partial
	return partial
}

func (st *Store) addCase(clientID int, category, dest, stage, deadline string) *CaseRow {
	st.mu.Lock()
	defer st.mu.Unlock()
	st.nextCaseID++
	c := &CaseRow{
		ID:          st.nextCaseID,
		ClientID:    clientID,
		Category:    &category,
		Destination: &dest,
		Stage:       stage,
		Deadline:    &deadline,
		CreatedAt:   nowISO(),
	}
	st.cases[c.ID] = c
	return c
}

func (st *Store) addDocument(d *Document) *Document {
	st.mu.Lock()
	defer st.mu.Unlock()
	st.nextDocID++
	d.ID = st.nextDocID
	d.CreatedAt = nowISO()
	st.docs[d.ID] = d
	return d
}

// small int-to-padded-string helper (avoid fmt dependency in hot path)
func itoaPad(n, width int) string {
	s := ""
	for n > 0 {
		s = string(rune('0'+n%10)) + s
		n /= 10
	}
	for len(s) < width {
		s = "0" + s
	}
	return s
}
