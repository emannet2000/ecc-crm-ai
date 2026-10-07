package main

import (
	"bytes"
	"encoding/json"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os/exec"
	"strings"
	"testing"
)

func imageUploadRequest(t *testing.T, h http.Handler, method, path, field, filename string, data []byte) *httptest.ResponseRecorder {
	t.Helper()
	var body bytes.Buffer
	form := multipart.NewWriter(&body)
	file, err := form.CreateFormFile(field, filename)
	if err != nil {
		t.Fatal(err)
	}
	if _, err = file.Write(data); err != nil {
		t.Fatal(err)
	}
	if err = form.Close(); err != nil {
		t.Fatal(err)
	}
	user, ok := findUserByEmail("demo@northwind.dev")
	if !ok {
		t.Fatal("demo user not found")
	}
	token, err := issueToken(user)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(method, path, &body)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", form.FormDataContentType())
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)
	return w
}

func TestRecordPhotoUploadReadRemoveAndAudit(t *testing.T) {
	setupStore(t)
	h := expansionTestMux()
	contact := newBareContact(t, h)

	var source bytes.Buffer
	bitmap := image.NewRGBA(image.Rect(0, 0, 32, 32))
	draw.Draw(bitmap, bitmap.Bounds(), &image.Uniform{C: color.RGBA{R: 30, G: 90, B: 180, A: 255}}, image.Point{}, draw.Src)
	if err := png.Encode(&source, bitmap); err != nil {
		t.Fatal(err)
	}
	photoPath := "/api/records/contacts/" + contact.ID + "/photo"
	assertStatus(t, imageUploadRequest(t, h, "PUT", photoPath, "photo", "profile.png", source.Bytes()), http.StatusOK)
	read := expansionRequest(t, h, "GET", photoPath, nil, "")
	assertStatus(t, read, http.StatusOK)
	if read.Header().Get("Content-Type") != "image/png" || !bytes.Equal(read.Body.Bytes(), source.Bytes()) {
		t.Fatal("uploaded photo did not round-trip with the expected image type")
	}
	var auditCount int
	if err := database.QueryRow("SELECT count(*) FROM audit_events WHERE entity='contacts' AND record_id=? AND action='photo_updated'", contact.ID).Scan(&auditCount); err != nil || auditCount != 1 {
		t.Fatalf("photo update was not audited: count=%d err=%v", auditCount, err)
	}
	assertStatus(t, expansionRequest(t, h, "DELETE", photoPath, nil, ""), http.StatusNoContent)
	assertStatus(t, expansionRequest(t, h, "GET", photoPath, nil, ""), http.StatusNotFound)
	if err := database.QueryRow("SELECT count(*) FROM audit_events WHERE entity='contacts' AND record_id=? AND action='photo_removed'", contact.ID).Scan(&auditCount); err != nil || auditCount != 1 {
		t.Fatalf("photo removal was not audited: count=%d err=%v", auditCount, err)
	}
}

func TestRecordPhotoRejectsMismatchedImageType(t *testing.T) {
	setupStore(t)
	h := expansionTestMux()
	contact := newBareContact(t, h)
	assertStatus(t, imageUploadRequest(t, h, "PUT", "/api/records/contacts/"+contact.ID+"/photo", "photo", "profile.jpg", []byte("not a jpeg")), http.StatusBadRequest)
}

func TestRecordQRGenerationAndImageDecode(t *testing.T) {
	if _, err := exec.LookPath("qrencode"); err != nil {
		t.Skip("qrencode executable is unavailable")
	}
	if _, err := exec.LookPath("zbarimg"); err != nil {
		t.Skip("zbarimg executable is unavailable")
	}
	setupStore(t)
	h := expansionTestMux()
	contact := newBareContact(t, h)
	qrPath := "/api/records/contacts/" + contact.ID + "/qr"
	qr := expansionRequest(t, h, "GET", qrPath, nil, "")
	assertStatus(t, qr, http.StatusOK)
	if qr.Header().Get("Content-Type") != "image/png" || !bytes.HasPrefix(qr.Body.Bytes(), []byte("\x89PNG\r\n\x1a\n")) {
		t.Fatal("QR endpoint did not return a PNG image")
	}
	decoded := imageUploadRequest(t, h, "POST", "/api/qr/decode", "image", "record.png", qr.Body.Bytes())
	assertStatus(t, decoded, http.StatusOK)
	var out struct {
		Value string `json:"value"`
	}
	if err := json.Unmarshal(decoded.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(out.Value, "/contacts/"+contact.ID) {
		t.Fatalf("QR image decoded to unexpected link %q", out.Value)
	}
}
