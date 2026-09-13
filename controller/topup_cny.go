package controller

import (
	"errors"
	"fmt"
	"math"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/shopspring/decimal"
)

// CNYTopUpQuote keeps payment money separate from the existing USD-based
// quota ledger. The quoted quota is frozen on the order, not recomputed at
// webhook time when the administrator may have changed the exchange rate.
type CNYTopUpQuote struct {
	PaymentAmountCNY  float64 `json:"payment_amount_cny"`
	CreditedQuota     int     `json:"credited_quota"`
	CreditedAmountUSD float64 `json:"credited_amount_usd"`
	Currency          string  `json:"currency"`
}

func quoteCNYTopUp(amount float64) (CNYTopUpQuote, error) {
	return quoteCNYTopUpWithMinimum(amount, operation_setting.MinTopUp)
}

func quoteCNYTopUpWithMinimum(amount float64, minimumUSD int) (CNYTopUpQuote, error) {
	rate := operation_setting.USDExchangeRate
	if math.IsNaN(rate) || math.IsInf(rate, 0) || rate <= 0 ||
		math.IsNaN(common.QuotaPerUnit) || math.IsInf(common.QuotaPerUnit, 0) || common.QuotaPerUnit <= 0 {
		return CNYTopUpQuote{}, errors.New("人民币汇率或额度单位配置无效")
	}
	if math.IsNaN(amount) || math.IsInf(amount, 0) || amount <= 0 {
		return CNYTopUpQuote{}, errors.New("充值金额必须是有效的正数")
	}
	money := decimal.NewFromFloat(amount)
	if !money.Equal(money.Round(2)) {
		return CNYTopUpQuote{}, errors.New("人民币充值金额最多保留两位小数")
	}
	minimum := decimal.Max(decimal.NewFromFloat(0.01), decimal.NewFromInt(int64(minimumUSD)).Mul(decimal.NewFromFloat(rate))).RoundCeil(2)
	if money.LessThan(minimum) {
		return CNYTopUpQuote{}, fmt.Errorf("充值金额不能小于 ¥%s", minimum.StringFixed(2))
	}
	creditUSD := money.Div(decimal.NewFromFloat(rate))
	quota, clamp := common.QuotaFromDecimalChecked(creditUSD.Mul(decimal.NewFromFloat(common.QuotaPerUnit)))
	if clamp != nil || quota <= 0 {
		return CNYTopUpQuote{}, errors.New("充值金额超出额度范围")
	}
	return CNYTopUpQuote{
		PaymentAmountCNY:  amount,
		CreditedQuota:     quota,
		CreditedAmountUSD: float64(quota) / common.QuotaPerUnit,
		Currency:          "CNY",
	}, nil
}
