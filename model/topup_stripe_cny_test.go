package model

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestStripeCNYFrozenCreditAndPaidValidation(t *testing.T) {
	for _, tc := range []struct {
		name, currency, payment, status string
		amount                          int64
		balance                         int
		wantError                       bool
	}{
		{"paid", "cny", "paid", "complete", 150000, 100, false},
		{"unpaid", "cny", "unpaid", "complete", 150000, 100, false},
		{"wrong currency", "usd", "paid", "complete", 150000, 100, true},
		{"wrong total", "cny", "paid", "complete", 150001, 100, true},
		{"incomplete", "cny", "paid", "open", 150000, 100, true},
		{"overflow", "cny", "paid", "complete", 150000, common.MaxQuota - 1, true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			truncateTables(t)
			insertUserForPaymentGuardTest(t, 7810, tc.balance)
			quota := 100000000
			order := &TopUp{UserId: 7810, TradeNo: "stripe-cny-credit", CreditedQuota: &quota, Money: 1500, PaymentProvider: PaymentProviderStripe, PaymentMethod: PaymentMethodStripe, Status: common.TopUpStatusPending}
			require.NoError(t, order.Insert())
			paid, applied, err := CompleteStripeCNYTopUp(order.TradeNo, tc.currency, tc.amount, tc.payment, tc.status, "cus_fixture")
			if tc.wantError {
				require.Error(t, err)
				assert.False(t, applied)
				assert.Equal(t, tc.balance, getUserQuotaForPaymentGuardTest(t, 7810))
				assert.Equal(t, common.TopUpStatusPending, getTopUpStatusForPaymentGuardTest(t, order.TradeNo))
				return
			}
			require.NoError(t, err)
			require.NotNil(t, paid)
			if tc.payment == "unpaid" {
				assert.False(t, applied)
				assert.Equal(t, tc.balance, getUserQuotaForPaymentGuardTest(t, 7810))
				return
			}
			assert.True(t, applied)
			assert.Equal(t, tc.balance+quota, getUserQuotaForPaymentGuardTest(t, 7810))
			_, applied, err = CompleteStripeCNYTopUp(order.TradeNo, "cny", 150000, "paid", "complete", "cus_fixture")
			require.NoError(t, err)
			assert.False(t, applied)
			assert.Equal(t, tc.balance+quota, getUserQuotaForPaymentGuardTest(t, 7810))
		})
	}
}

func TestStripeCNYLeavesLegacyUSDOrdersUntouched(t *testing.T) {
	truncateTables(t)
	order := &TopUp{TradeNo: "legacy-stripe-credit", Money: 200, PaymentProvider: PaymentProviderStripe, PaymentMethod: PaymentMethodStripe, Status: common.TopUpStatusPending}
	require.NoError(t, order.Insert())
	matched, applied, err := CompleteStripeCNYTopUp(order.TradeNo, "usd", 20000, "paid", "complete", "")
	require.NoError(t, err)
	assert.Nil(t, matched)
	assert.False(t, applied)
	assert.Equal(t, common.TopUpStatusPending, getTopUpStatusForPaymentGuardTest(t, order.TradeNo))
}
