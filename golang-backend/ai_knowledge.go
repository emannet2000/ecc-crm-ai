package main

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"
)

type aiKnowledge struct {
	ID        string      `json:"id"`
	Scope     RecordScope `json:"scope"`
	Title     string      `json:"title"`
	Category  string      `json:"category"`
	Entity    string      `json:"entity"`
	RecordID  string      `json:"recordId"`
	Filename  string      `json:"filename"`
	Content   string      `json:"content,omitempty"`
	UpdatedAt string      `json:"updatedAt"`
	Revision  string      `json:"revision"`
	Editable  bool        `json:"editable"`
}

func loadKnowledge(r *http.Request, id string) (aiKnowledge, error) {
	var k aiKnowledge
	var scope string
	err := storeDB(r).QueryRow("SELECT id,scope_data,title,category,entity,record_id,filename,content,updated_at FROM ai_knowledge WHERE id=? AND org_id=?", id, currentUser(r).OrgID).Scan(&k.ID, &scope, &k.Title, &k.Category, &k.Entity, &k.RecordID, &k.Filename, &k.Content, &k.UpdatedAt)
	if err != nil {
		return k, err
	}
	if json.Unmarshal([]byte(scope), &k.Scope) != nil || !canRead(k.Scope, currentUser(r)) {
		return k, fmt.Errorf("Knowledge source not accessible")
	}
	if k.RecordID != "" {
		if _, err := sqlRecord(r, k.Entity, k.RecordID); err != nil {
			return k, fmt.Errorf("Linked record not accessible")
		}
	}
	k.Editable = canWrite(k.Scope, currentUser(r))
	k.Revision = versionOf(map[string]any{"id": k.ID, "content": k.Content, "title": k.Title, "updatedAt": k.UpdatedAt, "scope": k.Scope})
	return k, nil
}
func knowledgeChunks(content string) []string {
	runes := []rune(content)
	chunks := []string{}
	for start := 0; start < len(runes); start += 1600 {
		end := start + 2000
		if end > len(runes) {
			end = len(runes)
		}
		chunks = append(chunks, string(runes[start:end]))
		if end == len(runes) {
			break
		}
	}
	return chunks
}
func saveKnowledge(r *http.Request, k aiKnowledge) error {
	tx, err := database.BeginTx(r.Context(), nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	_, err = tx.Exec(`INSERT INTO ai_knowledge VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET scope_data=excluded.scope_data,title=excluded.title,category=excluded.category,content=excluded.content,updated_at=excluded.updated_at`, k.ID, currentUser(r).OrgID, mustJSON(k.Scope), k.Title, k.Category, k.Entity, k.RecordID, k.Filename, k.Content, k.UpdatedAt)
	if err != nil {
		return err
	}
	if _, err = tx.Exec("DELETE FROM ai_knowledge_chunks WHERE knowledge_id=?", k.ID); err != nil {
		return err
	}
	for i, chunk := range knowledgeChunks(k.Content) {
		if _, err = tx.Exec("INSERT INTO ai_knowledge_chunks VALUES(?,?,?,?)", fmt.Sprintf("%s:%d", k.ID, i+1), k.ID, i+1, chunk); err != nil {
			return err
		}
	}
	return tx.Commit()
}
func handleKnowledgeList(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if len(q) > 200 {
		writeError(w, 400, "Search is limited to 200 characters")
		return
	}
	scope, args := scopeSQL(r, "scope_data")
	args = append(args, "%"+strings.NewReplacer("\\", "\\\\", "%", "\\%", "_", "\\_").Replace(q)+"%")
	rows, err := queryObjects(r, "SELECT id FROM ai_knowledge WHERE "+scope+" AND (title||' '||content) LIKE ? ESCAPE '\\' ORDER BY updated_at DESC LIMIT 101", args...)
	if err != nil {
		writeError(w, 500, "Could not load knowledge")
		return
	}
	out := []aiKnowledge{}
	for _, row := range rows {
		if k, err := loadKnowledge(r, fmtString(row["id"])); err == nil {
			k.Content = ""
			out = append(out, k)
		}
	}
	more := len(out) > 100
	if more {
		out = out[:100]
	}
	writeJSON(w, 200, map[string]any{"sources": out, "truncated": more})
}
func handleKnowledgeRead(w http.ResponseWriter, r *http.Request) {
	k, err := loadKnowledge(r, r.PathValue("source"))
	if err != nil {
		writeError(w, 404, "Knowledge source not found")
		return
	}
	writeJSON(w, 200, k)
}
func handleKnowledgeSave(w http.ResponseWriter, r *http.Request) {
	if currentUser(r).Role == "viewer" {
		writeError(w, 403, "Read-only users cannot change the knowledge library")
		return
	}
	k := aiKnowledge{ID: newID("knowledge"), Scope: RecordScope{OrgID: currentUser(r).OrgID, OwnerID: currentUser(r).ID, TeamID: currentUser(r).TeamID, Visibility: "private"}, Category: "procedure"}
	if id := r.PathValue("source"); id != "" {
		var err error
		k, err = loadKnowledge(r, id)
		if err != nil {
			writeError(w, 404, "Knowledge source not found")
			return
		}
		if !k.Editable {
			writeError(w, 403, "You cannot edit this knowledge source")
			return
		}
		if version := strings.Trim(r.Header.Get("If-Match"), "\""); version == "" || version != k.Revision {
			writeError(w, 409, "Refresh this knowledge source before saving")
			return
		}
	}
	var req struct{ Title, Category, Content, Visibility, Entity, RecordID, DocumentID string }
	if strings.HasPrefix(r.Header.Get("Content-Type"), "multipart/form-data") {
		r.Body = http.MaxBytesReader(w, r.Body, 9<<20)
		if err := r.ParseMultipartForm(9 << 20); err != nil {
			writeError(w, 400, "Upload a supported file up to 8 MB")
			return
		}
		defer r.MultipartForm.RemoveAll()
		req.Title = r.FormValue("title")
		req.Category = r.FormValue("category")
		req.Visibility = r.FormValue("visibility")
		req.Entity = r.FormValue("entity")
		req.RecordID = r.FormValue("recordId")
		file, header, err := r.FormFile("file")
		if err != nil {
			writeError(w, 400, "Choose a knowledge file")
			return
		}
		defer file.Close()
		data, err := io.ReadAll(io.LimitReader(file, (8<<20)+1))
		if err != nil || len(data) > 8<<20 {
			writeError(w, 400, "Knowledge files must be at most 8 MB")
			return
		}
		req.Content, err = extractKnowledgeText(r.Context(), header.Filename, data)
		if err != nil {
			writeError(w, 400, err.Error())
			return
		}
		k.Filename = filepath.Base(header.Filename)
		if req.Title == "" {
			req.Title = k.Filename
		}
	} else {
		if !decodeRequest(w, r, &req) {
			return
		}
	}
	if req.DocumentID != "" {
		doc, err := sqlRecord(r, "documents", req.DocumentID)
		if err != nil {
			writeError(w, 404, "Document not accessible")
			return
		}
		req.Entity = "documents"
		req.RecordID = req.DocumentID
		req.Content, k.Filename, err = existingDocumentText(r, req.DocumentID)
		if err != nil {
			writeError(w, 400, err.Error())
			return
		}
		if req.Title == "" {
			req.Title = recordLabel(mustJSON(doc))
		}
	}
	if req.Title == "" || len(req.Title) > 200 || strings.TrimSpace(req.Content) == "" || len([]rune(req.Content)) > 200000 || !utf8.ValidString(req.Content) || strings.ContainsRune(req.Content, 0) {
		writeError(w, 400, "Supply a title and up to 200,000 characters of valid text")
		return
	}
	if req.Category == "" {
		req.Category = "procedure"
	}
	validCategory := false
	for _, category := range []string{"policy", "requirements", "procedure", "document", "general"} {
		if req.Category == category {
			validCategory = true
		}
	}
	if !validCategory {
		writeError(w, 400, "Choose policy, requirements, procedure, document or general")
		return
	}
	if req.Visibility != "" {
		if req.Visibility != "private" && req.Visibility != "team" && req.Visibility != "organization" {
			writeError(w, 400, "Choose a valid visibility")
			return
		}
		if req.Visibility == "team" && k.Scope.TeamID == "" {
			writeError(w, 400, "Join a team before sharing with a team")
			return
		}
		k.Scope.Visibility = req.Visibility
	}
	if k.RecordID == "" && (req.Entity != "" || req.RecordID != "") {
		record, err := sqlRecord(r, req.Entity, req.RecordID)
		if err != nil {
			writeError(w, 404, "Linked record not accessible")
			return
		}
		var scope RecordScope
		json.Unmarshal([]byte(mustJSON(record)), &scope)
		if !canWrite(scope, currentUser(r)) {
			writeError(w, 403, "You cannot add knowledge to this record")
			return
		}
		k.Scope = scope
		k.Entity = req.Entity
		k.RecordID = req.RecordID
	}
	k.Title = req.Title
	k.Category = req.Category
	k.Content = req.Content
	k.UpdatedAt = time.Now().UTC().Format(time.RFC3339Nano)
	if err := saveKnowledge(r, k); err != nil {
		writeError(w, 500, "Could not index knowledge")
		return
	}
	k, err := loadKnowledge(r, k.ID)
	if err != nil {
		writeError(w, 500, "Could not reload knowledge")
		return
	}
	writeJSON(w, 201, k)
}
func handleKnowledgeDelete(w http.ResponseWriter, r *http.Request) {
	k, err := loadKnowledge(r, r.PathValue("source"))
	if err != nil {
		writeError(w, 404, "Knowledge source not found")
		return
	}
	if !k.Editable {
		writeError(w, 403, "You cannot delete this source")
		return
	}
	if strings.Trim(r.Header.Get("If-Match"), "\"") != k.Revision {
		writeError(w, 409, "Refresh this source before deleting")
		return
	}
	if _, err := storeDB(r).Exec("DELETE FROM ai_knowledge WHERE id=? AND org_id=?", k.ID, currentUser(r).OrgID); err != nil {
		writeError(w, 500, "Could not delete source")
		return
	}
	writeJSON(w, 200, statusResponse{"ok"})
}
func searchTerms(query string) []string {
	terms := strings.FieldsFunc(strings.ToLower(query), func(r rune) bool { return !unicode.IsLetter(r) && !unicode.IsDigit(r) })
	out := []string{}
	seen := map[string]bool{}
	for _, term := range terms {
		if len([]rune(term)) < 2 || seen[term] {
			continue
		}
		seen[term] = true
		out = append(out, term)
		if len(out) >= 8 {
			break
		}
	}
	return out
}
func (a *aiAgent) searchKnowledge(query string, offset int) (any, error) {
	if len(query) > 200 || offset < 0 || offset > 1000000 {
		return nil, fmt.Errorf("Use a search of up to 200 characters and a nonnegative offset")
	}
	terms := searchTerms(query)
	if len(terms) == 0 {
		return map[string]any{"excerpts": []any{}, "total": 0}, nil
	}
	scope, args := scopeSQL(a.R, "k.scope_data")
	predicates := []string{}
	for _, term := range terms {
		predicates = append(predicates, "(instr(lower(k.title),?)>0 OR instr(lower(c.content),?)>0)")
		args = append(args, term, term)
	}
	rows, err := queryObjects(a.R, "SELECT c.id,c.knowledge_id AS sourceId,c.position,c.content,k.title FROM ai_knowledge_chunks c JOIN ai_knowledge k ON k.id=c.knowledge_id WHERE "+scope+" AND ("+strings.Join(predicates, " OR ")+") ORDER BY k.updated_at DESC,c.position LIMIT 1001", args...)
	if err != nil {
		return nil, err
	}
	type excerpt struct {
		Ref  aiReference
		Text string
		Rank int
	}
	matches := []excerpt{}
	for _, row := range rows {
		sourceID := fmtString(row["sourceId"])
		if _, err := loadKnowledge(a.R, sourceID); err != nil {
			continue
		}
		text := fmtString(row["content"])
		rank := 0
		for _, term := range terms {
			rank += strings.Count(strings.ToLower(text), term)
			if strings.Contains(strings.ToLower(fmtString(row["title"])), term) {
				rank += 5
			}
		}
		matches = append(matches, excerpt{aiReference{Kind: "knowledge", ID: sourceID, Title: fmtString(row["title"]), SourceID: fmtString(row["id"]), URL: "#ai-knowledge=" + sourceID, Excerpt: compactWorkText(text, 300)}, text, rank})
	}
	sort.SliceStable(matches, func(i, j int) bool { return matches[i].Rank > matches[j].Rank })
	results := []map[string]any{}
	end := offset + 6
	if end > len(matches) {
		end = len(matches)
	}
	for i := offset; i < end; i++ {
		m := matches[i]
		a.addSource(m.Ref)
		results = append(results, map[string]any{"sourceId": m.Ref.SourceID, "title": m.Ref.Title, "text": m.Text})
	}
	return map[string]any{"excerpts": results, "total": len(matches), "hasMore": end < len(matches), "nextOffset": end, "candidateLimit": 1000}, nil
}

type limitedText struct{ bytes.Buffer }

func (b *limitedText) Write(p []byte) (int, error) {
	if b.Len()+len(p) > 800000 {
		return 0, fmt.Errorf("Extracted text exceeds the indexing limit")
	}
	return b.Buffer.Write(p)
}
func extractKnowledgeText(ctx context.Context, name string, data []byte) (string, error) {
	switch strings.ToLower(filepath.Ext(name)) {
	case ".txt", ".md", ".csv":
		if !utf8.Valid(data) {
			return "", fmt.Errorf("Use a UTF-8 text file")
		}
		if len(data) > 800000 {
			return "", fmt.Errorf("Text is too large")
		}
		return string(data), nil
	case ".pdf":
		if !bytes.HasPrefix(data, []byte("%PDF-")) {
			return "", fmt.Errorf("Invalid PDF")
		}
		ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
		defer cancel()
		command := exec.CommandContext(ctx, "pdftotext", "-layout", "-enc", "UTF-8", "-", "-")
		command.Stdin = bytes.NewReader(data)
		output := &limitedText{}
		command.Stdout = output
		if err := command.Run(); err != nil {
			return "", fmt.Errorf("PDF extraction failed. Install pdftotext or upload the document's text")
		}
		if strings.TrimSpace(output.String()) == "" {
			return "", fmt.Errorf("This PDF has no extractable text. Use document AI extraction/OCR and review the text before indexing")
		}
		return output.String(), nil
	case ".docx":
		archive, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
		if err != nil {
			return "", fmt.Errorf("Invalid DOCX")
		}
		for _, file := range archive.File {
			if file.Name != "word/document.xml" {
				continue
			}
			if file.UncompressedSize64 > 2<<20 {
				return "", fmt.Errorf("DOCX text is too large")
			}
			reader, err := file.Open()
			if err != nil {
				return "", err
			}
			defer reader.Close()
			decoder := xml.NewDecoder(io.LimitReader(reader, 2<<20))
			output := &limitedText{}
			for {
				token, err := decoder.Token()
				if err == io.EOF {
					break
				}
				if err != nil {
					return "", fmt.Errorf("Unreadable DOCX text")
				}
				switch t := token.(type) {
				case xml.CharData:
					if _, err = output.Write([]byte(t)); err != nil {
						return "", err
					}
				case xml.EndElement:
					if t.Name.Local == "p" {
						output.Write([]byte("\n"))
					}
				}
			}
			return output.String(), nil
		}
		return "", fmt.Errorf("DOCX has no document text")
	}
	return "", fmt.Errorf("Use TXT, Markdown, CSV, PDF or DOCX")
}
func existingDocumentText(r *http.Request, id string) (string, string, error) {
	if _, err := sqlRecord(r, "documents", id); err != nil {
		return "", "", fmt.Errorf("Document not accessible")
	}
	var path, name string
	if storeDB(r).QueryRow("SELECT storage_path,filename FROM file_versions WHERE org_id=? AND document_id=? ORDER BY version DESC LIMIT 1", currentUser(r).OrgID, id).Scan(&path, &name) != nil {
		return "", "", fmt.Errorf("Upload a document first")
	}
	rel, err := filepath.Rel(uploadRoot(), path)
	if err != nil || rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", "", fmt.Errorf("Document path is invalid")
	}
	file, err := os.Open(path)
	if err != nil {
		return "", "", fmt.Errorf("Document file unavailable")
	}
	defer file.Close()
	data, err := io.ReadAll(io.LimitReader(file, (8<<20)+1))
	if err != nil || len(data) > 8<<20 {
		return "", "", fmt.Errorf("Knowledge indexing supports files up to 8 MB")
	}
	text, err := extractKnowledgeText(r.Context(), name, data)
	return text, name, err
}
