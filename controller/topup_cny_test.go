package controller

import (
	"math"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/Calcium-Ion/go-epay/epay"
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCNYTopUpQuoteUsesExchangeRateOnce(t *testing.T) {
	oldRate, oldQuota, oldMin, oldPrice := operation_setting.USDExchangeRate, common.QuotaPerUnit, operation_setting.MinTopUp, operation_setting.Price
	t.Cleanup(func() {
		operation_setting.USDExchangeRate, common.QuotaPerUnit, operation_setting.MinTopUp, operation_setting.Price = oldRate, oldQuota, oldMin, oldPrice
	})
	operation_setting.USDExchangeRate, common.QuotaPerUnit, operation_setting.MinTopUp, operation_setting.Price = 7.5, 500000, 1, 999
	quote, err := quoteCNYTopUp(1500)
	require.NoError(t, err)
	assert.Equal(t, CNYTopUpQuote{PaymentAmountCNY: 1500, CreditedQuota: 100000000, CreditedAmountUSD: 200, Currency: "CNY"}, quote)
	quote, err = quoteCNYTopUp(7.51)
	require.NoError(t, err)
	assert.Equal(t, 500667, quote.CreditedQuota)
	assert.Equal(t, 7.51, quote.PaymentAmountCNY)
	assert.InDelta(t, 7.51, quote.CreditedAmountUSD*7.5, 0.00001)

	for _, amount := range []float64{0, -1, math.NaN(), math.Inf(1), 7.49, 7.501, 1e20} {
		_, err := quoteCNYTopUp(amount)
		assert.Error(t, err, "amount %v must not create an order", amount)
	}
	for _, rate := range []float64{0, -1, math.NaN(), math.Inf(1)} {
		operation_setting.USDExchangeRate = rate
		_, err := quoteCNYTopUp(1500)
		assert.Error(t, err)
	}
}

func TestEpayCallbackAcknowledgesOnlyCommittedCredit(t *testing.T) {
	oldDB, oldLogDB := model.DB, model.LOG_DB
	oldRedis := common.RedisEnabled
	oldAddress, oldID, oldKey, oldMethods := operation_setting.PayAddress, operation_setting.EpayId, operation_setting.EpayKey, operation_setting.PayMethods
	t.Cleanup(func() {
		model.DB, model.LOG_DB, common.RedisEnabled = oldDB, oldLogDB, oldRedis
		operation_setting.PayAddress, operation_setting.EpayId, operation_setting.EpayKey, operation_setting.PayMethods = oldAddress, oldID, oldKey, oldMethods
	})
	confirmPaymentComplianceForTest(t)
	db := setupModelListControllerTestDB(t)
	require.NoError(t, db.AutoMigrate(&model.TopUp{}, &model.Log{}))
	operation_setting.PayAddress, operation_setting.EpayId, operation_setting.EpayKey = "http://127.0.0.1:9009", "local-merchant", "local-test-signing-only"
	operation_setting.PayMethods = []map[string]string{{"type": "alipay"}}
	user := &model.User{Id: 7901, Username: "callback-test", Quota: 100, Status: common.UserStatusEnabled}
	require.NoError(t, db.Create(user).Error)
	credit := 500667
	order := &model.TopUp{UserId: user.Id, Amount: 1, CreditedQuota: &credit, Money: 7.51, TradeNo: "local-cny-callback", PaymentProvider: model.PaymentProviderEpay, PaymentMethod: "alipay", Status: common.TopUpStatusPending}
	require.NoError(t, order.Insert())
	for _, tc := range []struct {
		money            string
		invalidSignature bool
		response         string
		balance          int
	}{
		{"7.50", false, "fail", 100},
		{"7.51", true, "fail", 100},
		{"7.51", false, "success", 500767},
		{"7.51", false, "success", 500767},
	} {
		params := epay.GenerateParams(map[string]string{"pid": operation_setting.EpayId, "out_trade_no": order.TradeNo, "trade_status": epay.StatusTradeSuccess, "type": "alipay", "money": tc.money}, operation_setting.EpayKey)
		if tc.invalidSignature {
			params["sign"] = "invalid"
		}
		form := url.Values{}
		for key, value := range params {
			form.Set(key, value)
		}
		recorder := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(recorder)
		ctx.Request = httptest.NewRequest(http.MethodPost, "/api/user/epay/notify", strings.NewReader(form.Encode()))
		ctx.Request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		EpayNotify(ctx)
		assert.Equal(t, tc.response, recorder.Body.String())
		var updated model.User
		require.NoError(t, db.First(&updated, user.Id).Error)
		assert.Equal(t, tc.balance, updated.Quota)
	}
}

func TestCNYTopUpQuoteHTTPContract(t *testing.T) {
	oldRate, oldQuota, oldMin := operation_setting.USDExchangeRate, common.QuotaPerUnit, operation_setting.MinTopUp
	t.Cleanup(func() {
		operation_setting.USDExchangeRate, common.QuotaPerUnit, operation_setting.MinTopUp = oldRate, oldQuota, oldMin
	})
	operation_setting.USDExchangeRate, common.QuotaPerUnit, operation_setting.MinTopUp = 7.5, 500000, 1
	for _, tc := range []struct {
		body    string
		success bool
	}{
		{`{"payment_amount_cny":1500}`, true},
		{`{"payment_amount_cny":1500,"amount":200}`, false},
		{`{"payment_amount_cny":0}`, false},
	} {
		recorder := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(recorder)
		ctx.Request = httptest.NewRequest(http.MethodPost, "/api/user/amount", strings.NewReader(tc.body))
		ctx.Request.Header.Set("Content-Type", "application/json")
		RequestAmount(ctx)
		var response struct {
			Message string      `json:"message"`
			Data    interface{} `json:"data"`
		}
		require.NoError(t, common.Unmarshal(recorder.Body.Bytes(), &response))
		assert.Equal(t, tc.success, response.Message == "success")
		if tc.success {
			data, ok := response.Data.(map[string]interface{})
			require.True(t, ok)
			assert.Equal(t, float64(1500), data["payment_amount_cny"])
			assert.Equal(t, float64(100000000), data["credited_quota"])
			assert.Equal(t, "CNY", data["currency"])
		}
	}
}
