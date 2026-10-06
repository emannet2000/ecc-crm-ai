package main

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"io"
	"math/big"
	"net/http"
	"net/url"
	"strings"
	"testing"
	"time"
)

type identityTransport func(*http.Request) (*http.Response, error)

func (f identityTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }
func TestOIDCSignatureAudienceNonceVerifiedEmailAndReplay(t *testing.T) {
	setupStore(t)
	t.Setenv("OIDC_ISSUER_URL", "https://identity.example")
	t.Setenv("OIDC_CLIENT_ID", "crm-client")
	t.Setenv("OIDC_CLIENT_SECRET", "fixture-private")
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	old := identityHTTPClient
	t.Cleanup(func() { identityHTTPClient = old })
	nonce := ""
	verified := true
	wrongNonce := false
	identityHTTPClient = &http.Client{Transport: identityTransport(func(r *http.Request) (*http.Response, error) {
		var body string
		switch r.URL.Path {
		case "/.well-known/openid-configuration":
			body = mustJSON(map[string]any{"issuer": "https://identity.example", "authorization_endpoint": "https://identity.example/authorize", "token_endpoint": "https://identity.example/token", "jwks_uri": "https://identity.example/keys", "id_token_signing_alg_values_supported": []string{"RS256"}})
		case "/keys":
			body = mustJSON(map[string]any{"keys": []map[string]string{{"kty": "RSA", "kid": "fixture", "use": "sig", "alg": "RS256", "n": base64.RawURLEncoding.EncodeToString(key.N.Bytes()), "e": base64.RawURLEncoding.EncodeToString(big.NewInt(int64(key.E)).Bytes())}}})
		case "/token":
			r.ParseForm()
			if r.Form.Get("code_verifier") == "" {
				t.Fatal("PKCE verifier missing")
			}
			tokenNonce := nonce
			if wrongNonce {
				tokenNonce = "wrong"
			}
			token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{"iss": "https://identity.example", "sub": "fixture-user", "aud": "crm-client", "exp": time.Now().Add(time.Hour).Unix(), "iat": time.Now().Unix(), "nonce": tokenNonce, "email": "demo@northwind.dev", "email_verified": verified})
			token.Header["kid"] = "fixture"
			signed, e := token.SignedString(key)
			if e != nil {
				t.Fatal(e)
			}
			body = mustJSON(map[string]any{"access_token": "fixture-access", "token_type": "Bearer", "expires_in": 3600, "id_token": signed})
		default:
			return nil, fmt.Errorf("unexpected identity URL %s", r.URL)
		}
		return &http.Response{StatusCode: 200, Header: http.Header{"Content-Type": []string{"application/json"}}, Body: io.NopCloser(strings.NewReader(body))}, nil
	})}
	h := featureMux()
	start := func() (string, []*http.Cookie) {
		w := featureRequest(h, "GET", "/api/sso/start", nil, nil)
		assertStatus(t, w, 302)
		cookies := w.Result().Cookies()
		data, err := decryptSecret(cookies[0].Value)
		if err != nil {
			t.Fatal(err)
		}
		var saved map[string]string
		json.Unmarshal([]byte(data), &saved)
		nonce = saved["nonce"]
		location, _ := url.Parse(w.Header().Get("Location"))
		if location.Query().Get("code_challenge_method") != "S256" {
			t.Fatal("PKCE challenge missing")
		}
		return saved["state"], cookies
	}
	state, cookies := start()
	verified = false
	w := featureRequest(h, "GET", "/api/sso/callback?code=fixture&state="+state, nil, cookies)
	assertStatus(t, w, 403)
	verified = true
	wrongNonce = true
	w = featureRequest(h, "GET", "/api/sso/callback?code=fixture&state="+state, nil, cookies)
	assertStatus(t, w, 400)
	wrongNonce = false
	w = featureRequest(h, "GET", "/api/sso/callback?code=fixture&state="+state, nil, cookies)
	assertStatus(t, w, 303)
	assertStatus(t, featureRequest(h, "GET", "/api/me", nil, w.Result().Cookies()), 200)
	assertStatus(t, featureRequest(h, "GET", "/api/sso/callback?code=fixture&state="+state, nil, cookies), 400)
}
func TestUnconfiguredIntegrationsReportSetupState(t *testing.T) {
	setupStore(t)
	for _, key := range []string{"OIDC_ISSUER_URL", "SAML_METADATA_URL", "STRIPE_SECRET_KEY"} {
		t.Setenv(key, "")
	}
	h := featureMux()
	cookies := demoCookies(t, h)
	assertStatus(t, featureRequest(h, "GET", "/api/sso/start", nil, nil), 503)
	assertStatus(t, featureRequest(h, "GET", "/api/saml/start", nil, nil), 503)
	assertStatus(t, featureRequest(h, "POST", "/api/invoices/"+invoices[0].ID+"/checkout", map[string]string{}, cookies), 503)
}

func TestPendingStripeRefundReconcilesOnce(t *testing.T) {
	setupStore(t)
	t.Setenv("STRIPE_SECRET_KEY", "sk_test_fixture")
	h := featureMux()
	cookies := demoCookies(t, h)
	mu.Lock()
	payments[0].Method = "Stripe"
	payments[0].Reference = "pi_fixture"
	invoiceID := invoices[0].ID
	received := invoices[0].AmountReceived
	mu.Unlock()
	if err := saveStore(); err != nil {
		t.Fatal(err)
	}
	old := stripeHTTPClient
	t.Cleanup(func() { stripeHTTPClient = old })
	posts, gets := 0, 0
	stripeHTTPClient = &http.Client{Transport: identityTransport(func(r *http.Request) (*http.Response, error) {
		status := "pending"
		if r.Method == "POST" {
			posts++
			if r.Header.Get("Idempotency-Key") == "" {
				t.Fatal("refund idempotency missing")
			}
		} else {
			gets++
			status = "succeeded"
		}
		body := mustJSON(map[string]any{"id": "re_fixture", "status": status})
		return &http.Response{StatusCode: 200, Header: http.Header{"Content-Type": []string{"application/json"}}, Body: io.NopCloser(strings.NewReader(body))}, nil
	})}
	w := featureRequest(h, "POST", "/api/workflows/refund-request", map[string]any{"id": invoiceID, "amount": 50, "reason": "Provider fixture"}, cookies)
	assertStatus(t, w, 201)
	var result map[string]string
	json.Unmarshal(w.Body.Bytes(), &result)
	id := result["id"]
	assertStatus(t, featureRequest(h, "POST", "/api/workflows/refund-review", map[string]string{"id": id, "decision": "approved"}, cookies), 200)
	w = featureRequest(h, "POST", "/api/invoices/"+invoiceID+"/gateway-refund", map[string]string{"refundId": id}, cookies)
	assertStatus(t, w, 200)
	if !strings.Contains(w.Body.String(), "provider_pending") || invoices[0].AmountReceived != received {
		t.Fatal("pending refund was posted as paid")
	}
	assertStatus(t, featureRequest(h, "POST", "/api/workflows/refund-process", map[string]string{"id": id, "reference": "manual"}, cookies), 400)
	w = featureRequest(h, "POST", "/api/invoices/"+invoiceID+"/gateway-refund", map[string]string{"refundId": id}, cookies)
	assertStatus(t, w, 200)
	if invoices[0].AmountReceived != received-50 || posts != 1 || gets != 1 {
		t.Fatal("refund reconciliation duplicated or missing")
	}
	assertStatus(t, featureRequest(h, "POST", "/api/invoices/"+invoiceID+"/gateway-refund", map[string]string{"refundId": id}, cookies), 409)
}
