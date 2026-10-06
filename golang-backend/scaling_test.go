package main

import (
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
)

// Compare the new SQL read path with the legacy projected-cache handler at the
// same dataset size. Run: go test -run '^$' -bench BenchmarkRecordReads -benchmem
func BenchmarkRecordReads(b *testing.B) {
	for _, mode := range []string{"sql", "legacy"} {
		b.Run(mode, func(b *testing.B) {
			jwtSecret = []byte("benchmark-only-secret")
			b.Setenv("LEGACY_DATA_FILE", "")
			if err := loadStore(filepath.Join(b.TempDir(), "crm.sqlite3")); err != nil {
				b.Fatal(err)
			}
			b.Cleanup(func() { database.Close(); database = nil })
			u, _ := findUserByEmail("demo@northwind.dev")
			scope := RecordScope{OrgID: u.OrgID, OwnerID: u.ID, Visibility: "organization"}
			mu.Lock()
			for i := 0; i < 5000; i++ {
				contacts = append(contacts, Contact{RecordScope: scope, ID: newID("benchmark"), Name: "Benchmark client", Stage: "Lead"})
			}
			id := contacts[len(contacts)-1].ID
			mu.Unlock()
			if err := saveStore(); err != nil {
				b.Fatal(err)
			}
			token, err := issueToken(u)
			if err != nil {
				b.Fatal(err)
			}
			m := http.NewServeMux()
			registerExpansionRoutes(m)
			m.HandleFunc("GET /api/contacts/{id}", authMiddleware(getContact))
			h := persistMutations(m)
			path := "/api/contacts/" + id
			if mode == "sql" {
				path = "/api/records/contacts/" + id
			}
			b.ReportAllocs()
			b.ResetTimer()
			b.RunParallel(func(pb *testing.PB) {
				for pb.Next() {
					r := httptest.NewRequest("GET", path, nil)
					r.Header.Set("Authorization", "Bearer "+token)
					w := httptest.NewRecorder()
					h.ServeHTTP(w, r)
					if w.Code != 200 {
						b.Errorf("read failed: %d", w.Code)
					}
				}
			})
		})
	}
}
