package model

import (
	"errors"

	"github.com/QuantumNous/new-api/common"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// EpayCreditQuota supports old orders while preserving the exact frozen
// credit of new CNY-denominated orders. Amount remains the legacy USD count.
func (topUp *TopUp) EpayCreditQuota() (int, error) {
	if topUp.CreditedQuota != nil {
		if *topUp.CreditedQuota <= 0 || *topUp.CreditedQuota >= common.MaxQuota {
			return 0, errors.New("无效的充值额度")
		}
		return *topUp.CreditedQuota, nil
	}
	quota, clamp := common.QuotaFromDecimalChecked(decimal.NewFromInt(topUp.Amount).Mul(decimal.NewFromFloat(common.QuotaPerUnit)))
	if clamp != nil || quota <= 0 {
		return 0, errors.New("无效的充值额度")
	}
	return quota, nil
}

// CompleteEpayTopUp atomically marks an order paid and credits its user. A
// repeated signed callback returns applied=false without crediting again.
func CompleteEpayTopUp(tradeNo, paidMoney, paymentMethod string) (topUp *TopUp, applied bool, err error) {
	paid, err := decimal.NewFromString(paidMoney)
	if err != nil || !paid.IsPositive() || !paid.Equal(paid.Round(2)) {
		return nil, false, errors.New("无效的支付金额")
	}
	topUp = &TopUp{}
	err = DB.Transaction(func(tx *gorm.DB) error {
		if err := lockForUpdate(tx).Where("trade_no = ?", tradeNo).First(topUp).Error; err != nil {
			return ErrTopUpNotFound
		}
		if topUp.PaymentProvider != PaymentProviderEpay {
			return ErrPaymentMethodMismatch
		}
		if !paid.Equal(decimal.NewFromFloat(topUp.Money).Round(2)) {
			return errors.New("支付金额与订单不一致")
		}
		if topUp.Status == common.TopUpStatusSuccess {
			return nil
		}
		if topUp.Status != common.TopUpStatusPending {
			return ErrTopUpStatusInvalid
		}
		quota, err := topUp.EpayCreditQuota()
		if err != nil {
			return err
		}
		result := tx.Model(&User{}).Where("id = ? AND quota <= ?", topUp.UserId, common.MaxQuota-quota).
			Update("quota", gorm.Expr("quota + ?", quota))
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected != 1 {
			return errors.New("用户不存在或余额将超出额度上限")
		}
		topUp.Status = common.TopUpStatusSuccess
		topUp.CompleteTime = common.GetTimestamp()
		topUp.PaymentMethod = paymentMethod
		if err := tx.Save(topUp).Error; err != nil {
			return err
		}
		applied = true
		return nil
	})
	if err != nil {
		return nil, false, err
	}
	if applied {
		quota, _ := topUp.EpayCreditQuota()
		// Preserve pending batch debits already reflected in Redis but not SQL.
		if cacheErr := cacheIncrUserQuota(topUp.UserId, int64(quota)); cacheErr != nil {
			common.SysError("failed to update user cache after recharge: " + cacheErr.Error())
		}
	}
	return topUp, applied, nil
}
