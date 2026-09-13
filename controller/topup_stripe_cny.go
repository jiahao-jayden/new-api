package controller

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

func quoteStripeCNYTopUp(req *StripePayRequest) (CNYTopUpQuote, error) {
	if req.PaymentAmountCNY == nil || req.Amount != 0 {
		return CNYTopUpQuote{}, errors.New("请仅指定人民币充值金额")
	}
	quote, err := quoteCNYTopUpWithMinimum(*req.PaymentAmountCNY, setting.StripeMinTopUp)
	if err != nil {
		return CNYTopUpQuote{}, err
	}
	if decimal.NewFromFloat(quote.PaymentAmountCNY).Mul(decimal.NewFromInt(100)).GreaterThan(decimal.NewFromInt(99_999_999)) {
		return CNYTopUpQuote{}, errors.New("充值金额超出 Stripe 单笔金额上限")
	}
	return quote, nil
}

func requestStripeCNYPay(c *gin.Context, req *StripePayRequest) {
	if !isStripeTopUpEnabled() {
		c.JSON(http.StatusForbidden, gin.H{"message": "error", "data": "管理员尚未启用 Stripe 充值"})
		return
	}
	if req.PaymentMethod != model.PaymentMethodStripe {
		c.JSON(http.StatusBadRequest, gin.H{"message": "error", "data": "不支持的支付渠道"})
		return
	}
	quote, err := quoteStripeCNYTopUp(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "error", "data": err.Error()})
		return
	}
	for _, redirectURL := range []string{req.SuccessURL, req.CancelURL} {
		if redirectURL != "" && common.ValidateRedirectURL(redirectURL) != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "error", "data": "支付重定向 URL 不在可信任域名列表中"})
			return
		}
	}
	if !strings.HasPrefix(setting.StripeApiSecret, "sk_") && !strings.HasPrefix(setting.StripeApiSecret, "rk_") {
		c.JSON(http.StatusBadRequest, gin.H{"message": "error", "data": "管理员未配置有效的 Stripe 支付密钥"})
		return
	}
	user, err := model.GetUserById(c.GetInt("id"), false)
	if err != nil || user == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "error", "data": "获取用户信息失败"})
		return
	}
	client := session.Client{B: stripe.GetBackend(stripe.APIBackend), Key: setting.StripeApiSecret}
	link, err := createStripeCNYCheckout(c.Request.Context(), client, user, quote, req.SuccessURL, req.CancelURL)
	if err != nil {
		message := err.Error()
		var stripeError *stripe.Error
		if errors.As(err, &stripeError) {
			// Provider error messages can echo invalid API credentials.
			message = fmt.Sprintf("type=%s code=%s status=%d request_id=%s", stripeError.Type, stripeError.Code, stripeError.HTTPStatusCode, stripeError.RequestID)
		}
		logger.LogError(c.Request.Context(), fmt.Sprintf("Stripe 人民币 Checkout 创建失败 user_id=%d error=%q", user.Id, message))
		c.JSON(http.StatusBadGateway, gin.H{"message": "error", "data": "拉起支付失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "success", "data": gin.H{"pay_link": link}})
}

// createStripeCNYCheckout persists the immutable quote before contacting Stripe,
// so even an immediate webhook can find the pending order.
func createStripeCNYCheckout(ctx context.Context, client session.Client, user *model.User, quote CNYTopUpQuote, successURL, cancelURL string) (string, error) {
	if successURL == "" {
		successURL = paymentReturnPath("/wallet")
	}
	if cancelURL == "" {
		cancelURL = paymentReturnPath("/wallet")
	}
	reference := "cny_" + common.NewRequestId()
	order := &model.TopUp{
		UserId: user.Id, TradeNo: reference, Money: quote.PaymentAmountCNY, CreditedQuota: &quote.CreditedQuota,
		Amount:          int64(common.QuotaFromFloat(quote.CreditedAmountUSD)),
		PaymentProvider: model.PaymentProviderStripe, PaymentMethod: model.PaymentMethodStripe,
		CreateTime: time.Now().Unix(), Status: common.TopUpStatusPending,
	}
	if err := order.Insert(); err != nil {
		return "", err
	}
	cents := decimal.NewFromFloat(quote.PaymentAmountCNY).Mul(decimal.NewFromInt(100)).IntPart()
	params := &stripe.CheckoutSessionParams{
		ClientReferenceID: stripe.String(reference), SuccessURL: stripe.String(successURL), CancelURL: stripe.String(cancelURL),
		Mode:                stripe.String(string(stripe.CheckoutSessionModePayment)),
		AllowPromotionCodes: stripe.Bool(false), AdaptivePricing: &stripe.CheckoutSessionAdaptivePricingParams{Enabled: stripe.Bool(false)},
		AutomaticTax: &stripe.CheckoutSessionAutomaticTaxParams{Enabled: stripe.Bool(false)},
		LineItems: []*stripe.CheckoutSessionLineItemParams{{Quantity: stripe.Int64(1), PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
			Currency: stripe.String("cny"), UnitAmount: stripe.Int64(cents), ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{Name: stripe.String("账户充值")},
		}}},
		Metadata: map[string]string{"payment_currency": "cny"},
	}
	params.Context = ctx
	params.SetIdempotencyKey(reference)
	if user.StripeCustomer != "" {
		params.Customer = stripe.String(user.StripeCustomer)
	} else {
		params.CustomerCreation = stripe.String(string(stripe.CheckoutSessionCustomerCreationAlways))
		if user.Email != "" {
			params.CustomerEmail = stripe.String(user.Email)
		}
	}
	result, err := client.New(params)
	if err != nil {
		return "", err
	}
	if result == nil || result.URL == "" {
		return "", errors.New("Stripe did not return a Checkout URL")
	}
	return result.URL, nil
}

func processStripeCNYWebhook(event stripe.Event, callerIP string) (bool, error) {
	if event.Type != stripe.EventTypeCheckoutSessionCompleted && event.Type != stripe.EventTypeCheckoutSessionAsyncPaymentSucceeded {
		return false, nil
	}
	var checkout stripe.CheckoutSession
	if event.Data == nil {
		return true, errors.New("missing Stripe event data")
	}
	if err := common.Unmarshal(event.Data.Raw, &checkout); err != nil {
		return true, err
	}
	if checkout.ClientReferenceID == "" {
		if checkout.Metadata["payment_currency"] == "cny" {
			return true, errors.New("missing CNY order reference")
		}
		return false, nil
	}
	customerID := ""
	if checkout.Customer != nil {
		customerID = checkout.Customer.ID
	}
	order, applied, err := model.CompleteStripeCNYTopUp(checkout.ClientReferenceID, string(checkout.Currency), checkout.AmountTotal, string(checkout.PaymentStatus), string(checkout.Status), customerID)
	if errors.Is(err, model.ErrTopUpNotFound) && checkout.Metadata["payment_currency"] != "cny" {
		return false, nil
	}
	if err != nil {
		return true, err
	}
	if order == nil {
		return false, nil
	}
	if applied {
		model.RecordTopupLog(order.UserId, fmt.Sprintf("使用在线充值成功，支付人民币：%.2f，到账额度：%d", order.Money, *order.CreditedQuota), callerIP, model.PaymentMethodStripe, model.PaymentProviderStripe)
	}
	return true, nil
}
