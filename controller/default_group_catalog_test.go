package controller

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCustomerCatalogUsesOnlyDefaultChannelPrices(t *testing.T) {
	previousDB, previousLogDB := model.DB, model.LOG_DB
	previousRedis := common.RedisEnabled
	previousGroups := setting.UserUsableGroups2JSONString()
	previousRatios := ratio_setting.GroupRatio2JSONString()
	previousModelRatios := ratio_setting.ModelRatio2JSONString()
	t.Cleanup(func() {
		model.DB, model.LOG_DB = previousDB, previousLogDB
		common.RedisEnabled = previousRedis
		require.NoError(t, setting.UpdateUserUsableGroupsByJSONString(previousGroups))
		require.NoError(t, ratio_setting.UpdateGroupRatioByJSONString(previousRatios))
		require.NoError(t, ratio_setting.UpdateModelRatioByJSONString(previousModelRatios))
		model.InvalidatePricingCache()
	})
	db := setupModelListControllerTestDB(t)
	require.NoError(t, setting.UpdateUserUsableGroupsByJSONString(`{"default":"Default","private":"Private"}`))
	require.NoError(t, ratio_setting.UpdateGroupRatioByJSONString(`{"default":1,"private":0.1}`))
	require.NoError(t, ratio_setting.UpdateModelRatioByJSONString(`{"zz-shared":1,"zz-private":1,"zz-all-only":1}`))
	require.NoError(t, db.Create(&[]model.User{
		{Id: 981, Username: "catalog-user", AffCode: "catuser", Role: common.RoleCommonUser, Group: "default", Status: common.UserStatusEnabled},
		{Id: 982, Username: "catalog-admin", AffCode: "catadmin", Role: common.RoleAdminUser, Group: "default", Status: common.UserStatusEnabled},
	}).Error)
	require.NoError(t, db.Create(&[]model.Channel{
		{Id: 981, Key: "local-fixture", Status: common.ChannelStatusEnabled, Group: "default", Models: "zz-shared", OtherSettings: `{"billing_discount":0.5}`},
		{Id: 982, Key: "local-fixture", Status: common.ChannelStatusEnabled, Group: "private", Models: "zz-shared,zz-private", OtherSettings: `{"billing_discount":0.1}`},
		{Id: 983, Key: "local-fixture", Status: common.ChannelStatusEnabled, Group: "all", Models: "zz-all-only"},
	}).Error)
	require.NoError(t, db.Create(&[]model.Ability{
		{ChannelId: 981, Group: "default", Model: "zz-shared", Enabled: true},
		{ChannelId: 982, Group: "private", Model: "zz-shared", Enabled: true},
		{ChannelId: 982, Group: "private", Model: "zz-private", Enabled: true},
		{ChannelId: 983, Group: "all", Model: "zz-all-only", Enabled: true},
	}).Error)
	model.InvalidatePricingCache()
	// Admin follows customer to ensure customer filtering does not mutate the
	// globally cached model groups used by subsequent requests.
	for _, tc := range []struct {
		name     string
		userID   int
		isAdmin  bool
		minPrice float64
	}{
		{"customer", 981, false, 0.5},
		{"anonymous", 0, false, 0.5},
		{"administrator", 982, true, 0.1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(recorder)
			ctx.Request = httptest.NewRequest(http.MethodGet, "/api/pricing", nil)
			if tc.userID != 0 {
				ctx.Set("id", tc.userID)
			}
			GetPricing(ctx)
			require.Equal(t, http.StatusOK, recorder.Code)
			var response struct {
				Success     bool              `json:"success"`
				Data        []model.Pricing   `json:"data"`
				UsableGroup map[string]string `json:"usable_group"`
				AutoGroups  []string          `json:"auto_groups"`
			}
			require.NoError(t, common.Unmarshal(recorder.Body.Bytes(), &response))
			require.True(t, response.Success)
			prices := pricingByModelName(response.Data)
			require.Contains(t, prices, "zz-shared")
			assert.Equal(t, tc.minPrice, prices["zz-shared"].ChannelDiscountMin)
			if tc.isAdmin {
				assert.Contains(t, prices, "zz-private")
				assert.ElementsMatch(t, []string{"default", "private"}, prices["zz-shared"].EnableGroup)
			} else {
				assert.NotContains(t, prices, "zz-private")
				assert.NotContains(t, prices, "zz-all-only")
				assert.Equal(t, map[string]string{"default": "Default"}, response.UsableGroup)
				assert.Empty(t, response.AutoGroups)
				assert.Equal(t, []string{"default"}, prices["zz-shared"].EnableGroup)
				assert.Equal(t, 1, prices["zz-shared"].ChannelCount)
			}
			if tc.userID == 0 {
				return
			}
			modelRecorder := httptest.NewRecorder()
			modelContext, _ := gin.CreateTestContext(modelRecorder)
			modelContext.Request = httptest.NewRequest(http.MethodGet, "/api/user/models?group=private", nil)
			modelContext.Set("id", tc.userID)
			GetUserModels(modelContext)
			listed := decodeUserModelsResponse(t, modelRecorder)
			if tc.isAdmin {
				assert.ElementsMatch(t, []string{"zz-shared", "zz-private"}, listed)
			} else {
				assert.Empty(t, listed, "An old group query must not expose models that the fixed API key cannot call")
			}
			groupRecorder := httptest.NewRecorder()
			groupContext, _ := gin.CreateTestContext(groupRecorder)
			groupContext.Request = httptest.NewRequest(http.MethodGet, "/api/user/self/groups", nil)
			groupContext.Set("id", tc.userID)
			GetUserGroups(groupContext)
			var groupResponse struct {
				Success bool                      `json:"success"`
				Data    map[string]map[string]any `json:"data"`
			}
			require.NoError(t, common.Unmarshal(groupRecorder.Body.Bytes(), &groupResponse))
			require.True(t, groupResponse.Success)
			assert.Contains(t, groupResponse.Data, "default")
			if tc.isAdmin {
				assert.Contains(t, groupResponse.Data, "private")
			} else {
				assert.Len(t, groupResponse.Data, 1)
			}
		})
	}
}
