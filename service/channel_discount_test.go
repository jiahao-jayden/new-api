package service

import (
	"context"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/pkg/billingexpr"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/relay/helper"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupChannelBillingDatabase(t *testing.T) {
	t.Helper()
	truncate(t)
	// The shared service fixture creates SQLite directly; initialize the model
	// dialect identifiers as well before exercising real token-key lookups.
	t.Setenv("LOG_SQL_DSN", "")
	require.NoError(t, model.InitLogDB())
}

func TestDiscountedTextCacheToolsAndFixedPrice(t *testing.T) {
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	ctx.Set("claude_web_search_requests", 2)
	info := &relaycommon.RelayInfo{
		OriginModelName: "discounted-text", RelayFormat: types.RelayFormatOpenAI, StartTime: time.Now(),
		ChannelMeta: &relaycommon.ChannelMeta{},
		PriceData:   types.PriceData{ModelRatio: 2, CompletionRatio: 5, CacheRatio: 0.1, GroupRatioInfo: types.GroupRatioInfo{GroupRatio: 0.3, ChannelDiscount: common.GetPointer(0.3)}},
	}
	usage := &dto.Usage{PromptTokens: 1000, CompletionTokens: 100, PromptTokensDetails: dto.InputTokenDetails{CachedTokens: 200}}
	summary := calculateTextQuotaSummary(ctx, info, usage)
	// (800 input + 200 cache * .1 + 100 output * 5) * 2 * .3 = 792;
	// Claude search: 2 calls * $10/1000 * 500000 quota/$ * .3 = 3000.
	assert.Equal(t, 3792, summary.Quota)
	other := GenerateTextOtherInfo(ctx, info, 2, 0.3, 5, 200, 0.1, 0, -1)
	assert.Equal(t, 0.3, other["channel_discount"])
	assert.Equal(t, "channel", other["pricing_source"])
	info.PriceData.UsePrice = true
	info.PriceData.ModelPrice = 0.2
	ctx.Set("claude_web_search_requests", 0)
	assert.Equal(t, 30000, calculateTextQuotaSummary(ctx, info, usage).Quota)

	info.PriceData.UsePrice = false
	info.TieredBillingSnapshot = &billingexpr.BillingSnapshot{BillingMode: "tiered_expr", ExprString: `tier("base", p * 4 + c * 20 + cr * 0.4)`, GroupRatio: 0.3, QuotaPerUnit: common.QuotaPerUnit}
	info.TieredBillingSnapshot.ExprHash = billingexpr.ExprHashString(info.TieredBillingSnapshot.ExprString)
	params := BuildTieredTokenParams(usage, false, map[string]bool{"cr": true})
	ok, quota, result := TryTieredSettle(info, params)
	require.True(t, ok)
	assert.Equal(t, 792, quota)
	ctx.Set("claude_web_search_requests", 2)
	summary = calculateTextQuotaSummary(ctx, info, usage)
	assert.Equal(t, 3792, composeTieredTextQuota(info, summary, quota, result))
}

func TestChannelRetryReservationAndFinalCharge(t *testing.T) {
	setupChannelBillingDatabase(t)
	seedUser(t, 8201, 1000000)
	seedToken(t, 8201, 8201, "channel-retry-test", 1000000)
	saved := ratio_setting.ModelRatio2JSONString()
	t.Cleanup(func() { require.NoError(t, ratio_setting.UpdateModelRatioByJSONString(saved)) })
	require.NoError(t, ratio_setting.UpdateModelRatioByJSONString(`{"channel-retry-test":2}`))
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	info := &relaycommon.RelayInfo{UserId: 8201, TokenId: 8201, TokenKey: "channel-retry-test", OriginModelName: "channel-retry-test", ForcePreConsume: true, UserSetting: dto.UserSetting{BillingPreference: "wallet_only"}}
	for _, discount := range []float64{0.3, 0.5, 0.3} {
		common.SetContextKey(ctx, constant.ContextKeyChannelOtherSetting, dto.ChannelOtherSettings{BillingDiscount: &discount})
		price, err := helper.ModelPriceHelper(ctx, info, 100000, &types.TokenCountMeta{})
		require.NoError(t, err)
		require.Nil(t, ReserveBilling(ctx, price.QuotaToPreConsume, info))
	}
	// More expensive retry reserves the difference. A later cheaper retry does
	// not release funds until final settlement, which charges only that channel.
	assert.Equal(t, 900000, getUserQuota(t, 8201))
	assert.Equal(t, 900000, getTokenRemainQuota(t, 8201))
	require.NoError(t, info.Billing.Settle(60000))
	require.NoError(t, info.Billing.Settle(60000))
	info.Billing.Refund(ctx)
	assert.Equal(t, 940000, getUserQuota(t, 8201))
	assert.Equal(t, 940000, getTokenRemainQuota(t, 8201))
}

func TestRetryReservationRejectsInsufficientWalletWithoutAdditionalCharge(t *testing.T) {
	setupChannelBillingDatabase(t)
	seedUser(t, 8202, 700)
	seedToken(t, 8202, 8202, "channel-retry-insufficient", 1000)
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	info := &relaycommon.RelayInfo{UserId: 8202, TokenId: 8202, TokenKey: "channel-retry-insufficient", ForcePreConsume: true, UserSetting: dto.UserSetting{BillingPreference: "wallet_only"}}
	require.Nil(t, ReserveBilling(ctx, 300, info))
	require.NotNil(t, ReserveBilling(ctx, 800, info))
	assert.Equal(t, 400, getUserQuota(t, 8202))
	assert.Equal(t, 700, getTokenRemainQuota(t, 8202))
	require.NoError(t, info.Billing.Settle(0))
	assert.Equal(t, 700, getUserQuota(t, 8202))
	assert.Equal(t, 1000, getTokenRemainQuota(t, 8202))
}

func TestAsyncChannelDiscountSnapshotSurvivesLivePriceChanges(t *testing.T) {
	truncate(t)
	seedUser(t, 8203, 9000)
	seedToken(t, 8203, 8203, "channel-async-test", 9000)
	seedChannel(t, 8203)
	saved := ratio_setting.ModelRatio2JSONString()
	t.Cleanup(func() { require.NoError(t, ratio_setting.UpdateModelRatioByJSONString(saved)) })
	require.NoError(t, ratio_setting.UpdateModelRatioByJSONString(`{"test-model":8}`))
	task := makeTask(8203, 8203, 1000, 8203, BillingSourceWallet, 0)
	task.PrivateData.BillingContext = &model.TaskBillingContext{OriginModelName: "test-model", ModelRatio: 2, GroupRatio: 0.3, ChannelDiscount: common.GetPointer(0.3)}
	require.NoError(t, task.Insert())
	RecalculateTaskQuotaByTokens(context.Background(), task, 1000)
	assert.Equal(t, 600, task.Quota)
	assert.Equal(t, 9400, getUserQuota(t, 8203))
	assert.Equal(t, 9400, getTokenRemainQuota(t, 8203))
	RecalculateTaskQuotaByTokens(context.Background(), task, 1000)
	assert.Equal(t, 9400, getUserQuota(t, 8203))
	RefundTaskQuota(context.Background(), task, "upstream failed")
	assert.Equal(t, 10000, getUserQuota(t, 8203))
	assert.Equal(t, 10000, getTokenRemainQuota(t, 8203))
}

func TestRealtimeDiscountReservesOnceAcrossUsageFrames(t *testing.T) {
	setupChannelBillingDatabase(t)
	seedUser(t, 8204, 10000)
	seedToken(t, 8204, 8204, "channel-realtime-test", 10000)
	savedCompletion := ratio_setting.CompletionRatio2JSONString()
	savedAudio := ratio_setting.AudioRatio2JSONString()
	savedAudioCompletion := ratio_setting.AudioCompletionRatio2JSONString()
	t.Cleanup(func() {
		require.NoError(t, ratio_setting.UpdateCompletionRatioByJSONString(savedCompletion))
		require.NoError(t, ratio_setting.UpdateAudioRatioByJSONString(savedAudio))
		require.NoError(t, ratio_setting.UpdateAudioCompletionRatioByJSONString(savedAudioCompletion))
	})
	require.NoError(t, ratio_setting.UpdateCompletionRatioByJSONString(`{"channel-realtime-test":5}`))
	require.NoError(t, ratio_setting.UpdateAudioRatioByJSONString(`{"channel-realtime-test":4}`))
	require.NoError(t, ratio_setting.UpdateAudioCompletionRatioByJSONString(`{"channel-realtime-test":2}`))
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	info := &relaycommon.RelayInfo{
		UserId: 8204, TokenId: 8204, TokenKey: "channel-realtime-test", OriginModelName: "channel-realtime-test", ForcePreConsume: true,
		UserSetting: dto.UserSetting{BillingPreference: "wallet_only"},
		PriceData:   types.PriceData{ModelRatio: 2, GroupRatioInfo: types.GroupRatioInfo{GroupRatio: 0.3, ChannelDiscount: common.GetPointer(0.3)}},
	}
	require.Nil(t, ReserveBilling(ctx, 500, info))
	usage := &dto.RealtimeUsage{
		InputTokenDetails:  dto.InputTokenDetails{TextTokens: 1000, AudioTokens: 100},
		OutputTokenDetails: dto.OutputTokenDetails{TextTokens: 100, AudioTokens: 50},
	}
	require.NoError(t, PreWssConsumeQuota(ctx, info, usage))
	assert.Equal(t, 8620, getUserQuota(t, 8204))
	usage.InputTokenDetails.TextTokens *= 2
	usage.InputTokenDetails.AudioTokens *= 2
	usage.OutputTokenDetails.TextTokens *= 2
	usage.OutputTokenDetails.AudioTokens *= 2
	require.NoError(t, PreWssConsumeQuota(ctx, info, usage))
	assert.Equal(t, 7240, getUserQuota(t, 8204))
	require.NoError(t, info.Billing.Settle(2760))
	assert.Equal(t, 7240, getUserQuota(t, 8204))
	assert.Equal(t, 7240, getTokenRemainQuota(t, 8204))
}

func TestAsyncAdapterAppliesFrozenChannelDiscountOnce(t *testing.T) {
	truncate(t)
	seedUser(t, 8205, 9000)
	seedToken(t, 8205, 8205, "channel-adapter-test", 9000)
	seedChannel(t, 8205)
	task := makeTask(8205, 8205, 1000, 8205, BillingSourceWallet, 0)
	task.PrivateData.BillingContext.ChannelDiscount = common.GetPointer(0.3)
	require.NoError(t, task.Insert())
	settleTaskBillingOnComplete(context.Background(), &mockAdaptor{adjustReturn: 2000}, task, &relaycommon.TaskInfo{Status: model.TaskStatusSuccess})
	assert.Equal(t, 600, task.Quota)
	assert.Equal(t, 9400, getUserQuota(t, 8205))
	assert.Equal(t, 9400, getTokenRemainQuota(t, 8205))
}

func TestRealtimeTieredAudioReservesCumulativeUsageAtChannelDiscount(t *testing.T) {
	setupChannelBillingDatabase(t)
	seedUser(t, 8206, 10000)
	seedToken(t, 8206, 8206, "realtime-tiered-discount", 10000)
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	info := &relaycommon.RelayInfo{
		UserId: 8206, TokenId: 8206, TokenKey: "realtime-tiered-discount", OriginModelName: "realtime-tiered-discount", ForcePreConsume: true,
		UserSetting:           dto.UserSetting{BillingPreference: "wallet_only"},
		PriceData:             types.PriceData{GroupRatioInfo: types.GroupRatioInfo{GroupRatio: 0.3, ChannelDiscount: common.GetPointer(0.3)}},
		TieredBillingSnapshot: &billingexpr.BillingSnapshot{BillingMode: "tiered_expr", ExprString: `tier("base", p * 4 + c * 20 + ai * 16 + ao * 32)`, GroupRatio: 0.3, QuotaPerUnit: common.QuotaPerUnit},
	}
	info.TieredBillingSnapshot.ExprHash = billingexpr.ExprHashString(info.TieredBillingSnapshot.ExprString)
	require.Nil(t, ReserveBilling(ctx, 500, info))
	usage := &dto.RealtimeUsage{InputTokens: 1100, OutputTokens: 150, InputTokenDetails: dto.InputTokenDetails{TextTokens: 1000, AudioTokens: 100}, OutputTokenDetails: dto.OutputTokenDetails{TextTokens: 100, AudioTokens: 50}}
	require.NoError(t, PreWssConsumeQuota(ctx, info, usage))
	assert.Equal(t, 8620, getUserQuota(t, 8206))
	// Duplicate cumulative usage does not reserve or deduct it again.
	require.NoError(t, PreWssConsumeQuota(ctx, info, usage))
	assert.Equal(t, 8620, getUserQuota(t, 8206))
	require.NoError(t, info.Billing.Settle(1380))
	assert.Equal(t, 8620, getUserQuota(t, 8206))
	assert.Equal(t, 8620, getTokenRemainQuota(t, 8206))
}
