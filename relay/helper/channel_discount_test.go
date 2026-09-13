package helper

import (
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/pkg/billingexpr"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/setting/config"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestChannelDiscountAppliesToAllPriceEstimatesWithoutGroupStacking(t *testing.T) {
	savedPrices := ratio_setting.ModelPrice2JSONString()
	savedRatios := ratio_setting.ModelRatio2JSONString()
	savedGroups := ratio_setting.GroupRatio2JSONString()
	savedSpecial := ratio_setting.GroupGroupRatio2JSONString()
	savedConfig := map[string]string{}
	require.NoError(t, config.GlobalConfig.SaveToDB(func(k, v string) error { savedConfig[k] = v; return nil }))
	t.Cleanup(func() {
		require.NoError(t, ratio_setting.UpdateModelPriceByJSONString(savedPrices))
		require.NoError(t, ratio_setting.UpdateModelRatioByJSONString(savedRatios))
		require.NoError(t, ratio_setting.UpdateGroupRatioByJSONString(savedGroups))
		require.NoError(t, ratio_setting.UpdateGroupGroupRatioByJSONString(savedSpecial))
		require.NoError(t, config.GlobalConfig.LoadFromDB(savedConfig))
	})
	require.NoError(t, ratio_setting.UpdateModelPriceByJSONString(`{"discount-fixed":0.2}`))
	require.NoError(t, ratio_setting.UpdateModelRatioByJSONString(`{"discount-token":2}`))
	require.NoError(t, ratio_setting.UpdateGroupRatioByJSONString(`{"default":8,"fallback":9}`))
	require.NoError(t, ratio_setting.UpdateGroupGroupRatioByJSONString(`{"default":{"default":0.2,"fallback":0.1}}`))
	require.NoError(t, config.GlobalConfig.LoadFromDB(map[string]string{
		"billing_setting.billing_mode": `{"discount-tiered":"tiered_expr"}`,
		"billing_setting.billing_expr": `{"discount-tiered":"tier(\"base\", p * 2 + c * 10)"}`,
	}))
	for _, tc := range []struct {
		model   string
		perCall bool
		want    int
	}{
		{"discount-token", false, 60600},
		{"discount-fixed", false, 30000},
		{"discount-tiered", false, 31500},
		{"discount-token", true, 150000},
		{"discount-fixed", true, 30000},
	} {
		t.Run(tc.model+map[bool]string{true: "-task"}[tc.perCall], func(t *testing.T) {
			ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
			ctx.Set("auto_group", "fallback")
			common.SetContextKey(ctx, constant.ContextKeyChannelOtherSetting, dto.ChannelOtherSettings{BillingDiscount: common.GetPointer(0.3)})
			info := &relaycommon.RelayInfo{OriginModelName: tc.model, UserGroup: "default", UsingGroup: "default", BillingRequestInput: &billingexpr.RequestInput{}}
			var price types.PriceData
			var err error
			if tc.perCall {
				price, err = ModelPriceHelperPerCall(ctx, info)
			} else {
				price, err = ModelPriceHelper(ctx, info, 100000, &types.TokenCountMeta{MaxTokens: 1000})
			}
			require.NoError(t, err)
			assert.Equal(t, 0.3, price.GroupRatioInfo.GroupRatio)
			assert.False(t, price.GroupRatioInfo.HasSpecialRatio)
			assert.Equal(t, "fallback", info.UsingGroup)
			if tc.perCall {
				assert.Equal(t, tc.want, price.Quota)
			} else {
				assert.Equal(t, tc.want, price.QuotaToPreConsume)
			}
			if info.TieredBillingSnapshot != nil {
				assert.Equal(t, 0.3, info.TieredBillingSnapshot.GroupRatio)
			}
		})
	}
}

func TestRetryReplacesDiscountIncludingTieredSnapshot(t *testing.T) {
	saved := map[string]string{}
	require.NoError(t, config.GlobalConfig.SaveToDB(func(k, v string) error { saved[k] = v; return nil }))
	t.Cleanup(func() { require.NoError(t, config.GlobalConfig.LoadFromDB(saved)) })
	require.NoError(t, config.GlobalConfig.LoadFromDB(map[string]string{
		"billing_setting.billing_mode": `{"discount-retry":"tiered_expr"}`,
		"billing_setting.billing_expr": `{"discount-retry":"tier(\"base\", p * 2 + c * 10)"}`,
	}))
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	info := &relaycommon.RelayInfo{OriginModelName: "discount-retry", BillingRequestInput: &billingexpr.RequestInput{}}
	for _, discount := range []float64{0.3, 0.5} {
		common.SetContextKey(ctx, constant.ContextKeyChannelOtherSetting, dto.ChannelOtherSettings{BillingDiscount: &discount})
		_, err := ModelPriceHelper(ctx, info, 100000, &types.TokenCountMeta{})
		require.NoError(t, err)
		result, err := billingexpr.ComputeTieredQuotaWithRequest(info.TieredBillingSnapshot, billingexpr.TokenParams{P: 100000, C: 1000}, billingexpr.RequestInput{})
		require.NoError(t, err)
		assert.Equal(t, common.QuotaRound(105000*discount), result.ActualQuotaAfterGroup)
	}
}
