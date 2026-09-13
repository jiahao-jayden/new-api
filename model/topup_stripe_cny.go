package model

import (
	"errors"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// CompleteStripeCNYTopUp handles only new frozen CNY quotes. A nil order with
// nil error delegates legacy USD and subscription orders to their old handlers.
func CompleteStripeCNYTopUp(reference, currency string, amountTotal int64, paymentStatus, status, customerID string) (order *TopUp, applied bool, err error) {
	order = &TopUp{}
	err = DB.Transaction(func(tx *gorm.DB) error {
		if err := lockForUpdate(tx).Where("trade_no = ?", reference).First(order).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrTopUpNotFound
			}
			return err
		}
		if order.CreditedQuota == nil {
			order = nil
			return nil
		}
		if order.PaymentProvider != PaymentProviderStripe {
			return ErrPaymentMethodMismatch
		}
		if strings.ToLower(currency) != "cny" || amountTotal <= 0 || !decimal.NewFromFloat(order.Money).Mul(decimal.NewFromInt(100)).Equal(decimal.NewFromInt(amountTotal)) {
			return errors.New("Stripe 支付币种或金额与人民币订单不一致")
		}
		if status != "complete" {
			return errors.New("Stripe Checkout 尚未完成")
		}
		// Delayed methods are fulfilled only after a paid webhook.
		if paymentStatus != "paid" {
			return nil
		}
		if order.Status == common.TopUpStatusSuccess {
			return nil
		}
		if order.Status != common.TopUpStatusPending {
			return ErrTopUpStatusInvalid
		}
		quota, err := order.EpayCreditQuota()
		if err != nil {
			return err
		}
		updates := map[string]interface{}{"quota": gorm.Expr("quota + ?", quota)}
		if customerID != "" {
			updates["stripe_customer"] = customerID
		}
		result := tx.Model(&User{}).Where("id = ? AND quota <= ?", order.UserId, common.MaxQuota-quota).Updates(updates)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected != 1 {
			return errors.New("用户不存在或余额将超出额度上限")
		}
		order.Status = common.TopUpStatusSuccess
		order.CompleteTime = common.GetTimestamp()
		if err := tx.Save(order).Error; err != nil {
			return err
		}
		applied = true
		return nil
	})
	if err != nil {
		return nil, false, err
	}
	if applied {
		if err := cacheIncrUserQuota(order.UserId, int64(*order.CreditedQuota)); err != nil {
			common.SysError("failed to update cached Stripe recharge quota: " + err.Error())
		}
	}
	return order, applied, nil
}
