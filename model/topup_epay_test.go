package model

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCompleteEpayTopUpFrozenCreditAndIdempotency(t *testing.T) {
	truncateTables(t)
	insertUserForPaymentGuardTest(t, 7801, 12)
	quota := 500667
	order := &TopUp{UserId: 7801, Amount: 1, CreditedQuota: &quota, Money: 7.51, TradeNo: "cny-frozen-credit", PaymentMethod: "alipay", PaymentProvider: PaymentProviderEpay, Status: common.TopUpStatusPending}
	require.NoError(t, order.Insert())
	paid, applied, err := CompleteEpayTopUp(order.TradeNo, "7.51", "wxpay")
	require.NoError(t, err)
	require.True(t, applied)
	assert.Equal(t, "wxpay", paid.PaymentMethod)
	assert.Equal(t, quota+12, getUserQuotaForPaymentGuardTest(t, 7801))
	assert.Equal(t, common.TopUpStatusSuccess, getTopUpStatusForPaymentGuardTest(t, order.TradeNo))
	_, applied, err = CompleteEpayTopUp(order.TradeNo, "7.51", "wxpay")
	require.NoError(t, err)
	assert.False(t, applied)
	assert.Equal(t, quota+12, getUserQuotaForPaymentGuardTest(t, 7801))
	// Manual completion after a callback is equally idempotent.
	require.NoError(t, ManualCompleteTopUp(order.TradeNo, "127.0.0.1"))
	assert.Equal(t, quota+12, getUserQuotaForPaymentGuardTest(t, 7801))
}

func TestCompleteEpayTopUpRejectsInvalidPaymentWithoutChangingMoney(t *testing.T) {
	for _, tc := range []struct {
		name     string
		paid     string
		provider string
		status   string
		balance  int
	}{
		{"wrong amount", "7.50", PaymentProviderEpay, common.TopUpStatusPending, 100},
		{"wrong provider", "7.51", PaymentProviderStripe, common.TopUpStatusPending, 100},
		{"expired", "7.51", PaymentProviderEpay, common.TopUpStatusExpired, 100},
		{"overflow", "7.51", PaymentProviderEpay, common.TopUpStatusPending, common.MaxQuota - 1},
		{"invalid precision", "7.511", PaymentProviderEpay, common.TopUpStatusPending, 100},
	} {
		t.Run(tc.name, func(t *testing.T) {
			truncateTables(t)
			insertUserForPaymentGuardTest(t, 7802, tc.balance)
			quota := 500667
			order := &TopUp{UserId: 7802, Amount: 1, CreditedQuota: &quota, Money: 7.51, TradeNo: "cny-invalid-credit", PaymentMethod: "alipay", PaymentProvider: tc.provider, Status: tc.status}
			require.NoError(t, order.Insert())
			_, applied, err := CompleteEpayTopUp(order.TradeNo, tc.paid, "alipay")
			require.Error(t, err)
			assert.False(t, applied)
			assert.Equal(t, tc.balance, getUserQuotaForPaymentGuardTest(t, 7802))
			assert.Equal(t, tc.status, getTopUpStatusForPaymentGuardTest(t, order.TradeNo))
		})
	}
}

func TestEpayLegacyAndManualCreditCompatibility(t *testing.T) {
	for _, frozen := range []bool{false, true} {
		t.Run(map[bool]string{false: "legacy", true: "frozen manual"}[frozen], func(t *testing.T) {
			truncateTables(t)
			insertUserForPaymentGuardTest(t, 7803, 0)
			order := &TopUp{UserId: 7803, Amount: 2, Money: 15, TradeNo: "epay-credit-compatible", PaymentMethod: "alipay", PaymentProvider: PaymentProviderEpay, Status: common.TopUpStatusPending}
			want := common.QuotaFromFloat(2 * common.QuotaPerUnit)
			if frozen {
				want = 1000667
				order.CreditedQuota = &want
			}
			require.NoError(t, order.Insert())
			if frozen {
				require.NoError(t, ManualCompleteTopUp(order.TradeNo, "127.0.0.1"))
			} else {
				_, applied, err := CompleteEpayTopUp(order.TradeNo, "15.00", "alipay")
				require.NoError(t, err)
				require.True(t, applied)
			}
			assert.Equal(t, want, getUserQuotaForPaymentGuardTest(t, 7803))
		})
	}
}
