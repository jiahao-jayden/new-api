package controller

import (
	"bytes"
	"context"
	"math"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
	"github.com/stripe/stripe-go/v81/webhook"
)

func TestStripeCNYQuoteHTTPUsesRMBExactly(t *testing.T) {
	oldRate, oldMin, oldPrice := operation_setting.USDExchangeRate, setting.StripeMinTopUp, setting.StripeUnitPrice
	t.Cleanup(func() {
		operation_setting.USDExchangeRate, setting.StripeMinTopUp, setting.StripeUnitPrice = oldRate, oldMin, oldPrice
	})
	operation_setting.USDExchangeRate, setting.StripeMinTopUp, setting.StripeUnitPrice = 7.5, 2, 999
	for _, tc := range []struct {
		body string
		ok   bool
	}{
		{`{"payment_amount_cny":1500}`, true},
		{`{"payment_amount_cny":14.99}`, false},
		{`{"payment_amount_cny":1500,"amount":200}`, false},
		{`{"payment_amount_cny":1500.001}`, false},
	} {
		recorder := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(recorder)
		ctx.Request = httptest.NewRequest(http.MethodPost, "/api/user/stripe/amount", strings.NewReader(tc.body))
		ctx.Request.Header.Set("Content-Type", "application/json")
		RequestStripeAmount(ctx)
		var response struct {
			Message string
			Data    interface{}
		}
		require.NoError(t, common.Unmarshal(recorder.Body.Bytes(), &response))
		assert.Equal(t, tc.ok, response.Message == "success")
		if tc.ok {
			data := response.Data.(map[string]interface{})
			assert.Equal(t, 1500.0, data["payment_amount_cny"])
			assert.Equal(t, 100000000.0, data["credited_quota"])
		}
	}
}

func TestStripeCNYQuoteBoundsStripeAmountBeforeIntegerConversion(t *testing.T) {
	oldRate, oldMin := operation_setting.USDExchangeRate, setting.StripeMinTopUp
	t.Cleanup(func() { operation_setting.USDExchangeRate, setting.StripeMinTopUp = oldRate, oldMin })
	operation_setting.USDExchangeRate, setting.StripeMinTopUp = 1e20, 0
	for _, amount := range []float64{math.NaN(), math.Inf(1), -1, 0, 1e22} {
		_, err := quoteStripeCNYTopUp(&StripePayRequest{PaymentAmountCNY: &amount})
		require.Error(t, err)
	}
}

func TestStripeCNYCheckoutWireAndOrderBeforeProvider(t *testing.T) {
	db := setupModelListControllerTestDB(t)
	require.NoError(t, db.AutoMigrate(&model.TopUp{}))
	var observedReference string
	providerFailure := false
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !assert.NoError(t, r.ParseForm()) {
			w.WriteHeader(400)
			return
		}
		assert.Equal(t, "/v1/checkout/sessions", r.URL.Path)
		assert.Equal(t, "cny", r.Form.Get("line_items[0][price_data][currency]"))
		assert.Equal(t, "150000", r.Form.Get("line_items[0][price_data][unit_amount]"))
		assert.Equal(t, "1", r.Form.Get("line_items[0][quantity]"))
		assert.Equal(t, "false", r.Form.Get("adaptive_pricing[enabled]"))
		assert.Equal(t, "false", r.Form.Get("allow_promotion_codes"))
		assert.Empty(t, r.Form.Get("payment_method_types[0]"))
		assert.Empty(t, r.Form.Get("line_items[0][price]"))
		observedReference = r.Form.Get("client_reference_id")
		assert.Equal(t, observedReference, r.Header.Get("Idempotency-Key"))
		var order model.TopUp
		if assert.NoError(t, db.Where("trade_no = ?", observedReference).First(&order).Error) {
			assert.Equal(t, common.TopUpStatusPending, order.Status)
			assert.Equal(t, 1500.0, order.Money)
			assert.Equal(t, 100000000, *order.CreditedQuota)
		}
		w.Header().Set("Content-Type", "application/json")
		if providerFailure {
			w.WriteHeader(http.StatusInternalServerError)
			_, _ = w.Write([]byte(`{"error":{"message":"local fixture failure","type":"api_error"}}`))
			return
		}
		_, _ = w.Write([]byte(`{"id":"cs_fixture","object":"checkout.session","url":"https://checkout.stripe.com/fixture"}`))
	}))
	defer server.Close()
	backend := stripe.GetBackendWithConfig(stripe.APIBackend, &stripe.BackendConfig{URL: stripe.String(server.URL), HTTPClient: server.Client(), MaxNetworkRetries: stripe.Int64(0)})
	client := session.Client{B: backend, Key: "fixture-not-a-real-api-key"}
	url, err := createStripeCNYCheckout(context.Background(), client, &model.User{Id: 7800, Email: "fixture@example.com"}, CNYTopUpQuote{PaymentAmountCNY: 1500, CreditedQuota: 100000000, CreditedAmountUSD: 200, Currency: "CNY"}, "https://example.com/success", "https://example.com/cancel")
	require.NoError(t, err)
	assert.Equal(t, "https://checkout.stripe.com/fixture", url)
	assert.NotEmpty(t, observedReference)
	providerFailure = true
	_, err = createStripeCNYCheckout(context.Background(), client, &model.User{Id: 7800}, CNYTopUpQuote{PaymentAmountCNY: 1500, CreditedQuota: 100000000, CreditedAmountUSD: 200, Currency: "CNY"}, "https://example.com/success", "https://example.com/cancel")
	require.Error(t, err)
	var pending int64
	require.NoError(t, db.Model(&model.TopUp{}).Where("status = ?", common.TopUpStatusPending).Count(&pending).Error)
	assert.Equal(t, int64(2), pending, "uncertain provider failures preserve the quote for a later valid webhook")
}

func TestStripeCNYSignedWebhookRejectsTamperingAndRetriesFailedCredit(t *testing.T) {
	db := setupModelListControllerTestDB(t)
	require.NoError(t, db.AutoMigrate(&model.TopUp{}, &model.Log{}))
	confirmPaymentComplianceForTest(t)
	oldKey, oldSecret, oldPrice := setting.StripeApiSecret, setting.StripeWebhookSecret, setting.StripePriceId
	t.Cleanup(func() {
		setting.StripeApiSecret, setting.StripeWebhookSecret, setting.StripePriceId = oldKey, oldSecret, oldPrice
	})
	setting.StripeApiSecret, setting.StripeWebhookSecret, setting.StripePriceId = "fixture-key", "fixture-webhook-secret", "fixture-price"
	user := model.User{Id: 7811, Username: "stripe-cny-webhook", Quota: 100}
	require.NoError(t, db.Create(&user).Error)
	credit := 100000000
	order := model.TopUp{UserId: user.Id, TradeNo: "cny-webhook", Money: 1500, CreditedQuota: &credit, PaymentProvider: model.PaymentProviderStripe, PaymentMethod: model.PaymentMethodStripe, Status: common.TopUpStatusPending}
	require.NoError(t, order.Insert())
	router := gin.New()
	router.POST("/api/stripe/webhook", StripeWebhook)
	for _, tc := range []struct {
		name, currency, eventType, paymentStatus string
		badSignature                             bool
		wantStatus                               int
		wantCredit                               bool
	}{
		{"bad signature", "cny", "checkout.session.completed", "paid", true, 400, false},
		{"wrong currency retries", "usd", "checkout.session.completed", "paid", false, 500, false},
		{"delayed payment pending", "cny", "checkout.session.completed", "unpaid", false, 200, false},
		{"delayed payment paid", "cny", "checkout.session.async_payment_succeeded", "paid", false, 200, true},
		{"duplicate", "cny", "checkout.session.completed", "paid", false, 200, true},
		{"stale failed event", "cny", "checkout.session.async_payment_failed", "unpaid", false, 200, true},
	} {
		payload, err := common.Marshal(map[string]interface{}{"id": "evt_fixture", "object": "event", "type": tc.eventType, "data": map[string]interface{}{"object": map[string]interface{}{"id": "cs_fixture", "object": "checkout.session", "client_reference_id": order.TradeNo, "currency": tc.currency, "amount_total": 150000, "status": "complete", "payment_status": tc.paymentStatus, "metadata": map[string]string{"payment_currency": "cny"}}}})
		require.NoError(t, err)
		signed := webhook.GenerateTestSignedPayload(&webhook.UnsignedPayload{Payload: payload, Secret: setting.StripeWebhookSecret})
		recorder := httptest.NewRecorder()
		request := httptest.NewRequest(http.MethodPost, "/api/stripe/webhook", bytes.NewReader(payload))
		request.Header.Set("Stripe-Signature", signed.Header)
		if tc.badSignature {
			request.Header.Set("Stripe-Signature", "invalid")
		}
		router.ServeHTTP(recorder, request)
		assert.Equal(t, tc.wantStatus, recorder.Code, tc.name)
		var current model.User
		require.NoError(t, db.First(&current, user.Id).Error)
		if tc.wantCredit {
			assert.Equal(t, 100+credit, current.Quota)
		} else {
			assert.Equal(t, 100, current.Quota)
		}
	}
	var logs int64
	require.NoError(t, db.Model(&model.Log{}).Where("user_id = ? AND type = ?", user.Id, model.LogTypeTopup).Count(&logs).Error)
	assert.Equal(t, int64(1), logs)
	var currentOrder model.TopUp
	require.NoError(t, db.First(&currentOrder, order.Id).Error)
	assert.Equal(t, common.TopUpStatusSuccess, currentOrder.Status)
}
