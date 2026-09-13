package controller

import (
	"net/http"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAddTokenAlwaysUsesDefaultGroup(t *testing.T) {
	for _, test := range []struct {
		name  string
		role  int
		group string
	}{
		{name: "omitted group", role: common.RoleCommonUser},
		{name: "legacy auto client", role: common.RoleCommonUser, group: "auto"},
		{name: "explicit other group", role: common.RoleCommonUser, group: "vip"},
		{name: "administrator key", role: common.RoleRootUser, group: "debug"},
	} {
		t.Run(test.name, func(t *testing.T) {
			db := setupTokenControllerTestDB(t)
			body := map[string]any{
				"user_id": 999, "name": "restricted-key", "group": test.group,
				"cross_group_retry": true, "expired_time": 4102444800,
				"remain_quota": 12345, "unlimited_quota": false,
				"model_limits_enabled": true, "model_limits": "gpt-5.5,claude-sonnet-4-6",
				"allow_ips": "192.0.2.0/24",
			}
			ctx, recorder := newAuthenticatedContext(t, http.MethodPost, "/api/token/", body, 7)
			ctx.Set("role", test.role)
			AddToken(ctx)
			response := decodeAPIResponse(t, recorder)
			require.True(t, response.Success, response.Message)

			var token model.Token
			require.NoError(t, db.First(&token).Error)
			assert.Equal(t, 7, token.UserId)
			assert.Equal(t, "default", token.Group)
			assert.False(t, token.CrossGroupRetry)
			assert.Equal(t, "restricted-key", token.Name)
			assert.Equal(t, common.TokenStatusEnabled, token.Status)
			assert.Equal(t, int64(4102444800), token.ExpiredTime)
			assert.Equal(t, 12345, token.RemainQuota)
			assert.False(t, token.UnlimitedQuota)
			assert.True(t, token.ModelLimitsEnabled)
			assert.Equal(t, "gpt-5.5,claude-sonnet-4-6", token.ModelLimits)
			require.NotNil(t, token.AllowIps)
			assert.Equal(t, "192.0.2.0/24", *token.AllowIps)
			assert.NotEmpty(t, token.Key)
		})
	}
}

func TestUpdateTokenNormalizesLegacyGroupAndPreservesOtherFields(t *testing.T) {
	for _, statusOnly := range []bool{false, true} {
		name := "full update"
		if statusOnly {
			name = "status only"
		}
		t.Run(name, func(t *testing.T) {
			db := setupTokenControllerTestDB(t)
			ip := "192.0.2.1"
			original := model.Token{
				UserId: 7, Key: "original-key", Name: "original-name", Group: "auto",
				CrossGroupRetry: true, ExpiredTime: 4102444800, RemainQuota: 500,
				UsedQuota: 200, ModelLimitsEnabled: true, ModelLimits: "gpt-5.5", AllowIps: &ip,
			}
			// Seed a pre-migration key without applying the new creation policy.
			require.NoError(t, db.Create(&original).Error)
			body := map[string]any{"id": original.Id, "status": common.TokenStatusDisabled}
			target := "/api/token/"
			if statusOnly {
				target += "?status_only=true"
			} else {
				body["name"] = "edited-name"
				body["expired_time"] = -1
				body["remain_quota"] = 800
				body["unlimited_quota"] = true
				body["model_limits_enabled"] = false
				body["model_limits"] = "claude-sonnet-4-6"
				body["allow_ips"] = "198.51.100.0/24"
				body["group"] = "vip"
				body["cross_group_retry"] = true
			}
			ctx, recorder := newAuthenticatedContext(t, http.MethodPut, target, body, 7)
			UpdateToken(ctx)
			response := decodeAPIResponse(t, recorder)
			require.True(t, response.Success, response.Message)

			var token model.Token
			require.NoError(t, db.First(&token, original.Id).Error)
			assert.Equal(t, "default", token.Group)
			assert.False(t, token.CrossGroupRetry)
			assert.Equal(t, original.Key, token.Key)
			assert.Equal(t, original.UserId, token.UserId)
			assert.Equal(t, original.UsedQuota, token.UsedQuota)
			if statusOnly {
				assert.Equal(t, common.TokenStatusDisabled, token.Status)
				assert.Equal(t, original.Name, token.Name)
				assert.Equal(t, original.ExpiredTime, token.ExpiredTime)
				assert.Equal(t, original.RemainQuota, token.RemainQuota)
				assert.Equal(t, original.UnlimitedQuota, token.UnlimitedQuota)
				assert.Equal(t, original.ModelLimitsEnabled, token.ModelLimitsEnabled)
				assert.Equal(t, original.ModelLimits, token.ModelLimits)
				assert.Equal(t, original.AllowIps, token.AllowIps)
			} else {
				assert.Equal(t, original.Status, token.Status)
				assert.Equal(t, "edited-name", token.Name)
				assert.Equal(t, int64(-1), token.ExpiredTime)
				assert.Equal(t, 800, token.RemainQuota)
				assert.True(t, token.UnlimitedQuota)
				assert.False(t, token.ModelLimitsEnabled)
				assert.Equal(t, "claude-sonnet-4-6", token.ModelLimits)
				require.NotNil(t, token.AllowIps)
				assert.Equal(t, "198.51.100.0/24", *token.AllowIps)
			}
			var returned model.Token
			require.NoError(t, common.Unmarshal(response.Data, &returned))
			assert.Equal(t, token.Group, returned.Group)
			assert.False(t, returned.CrossGroupRetry)
			assert.Equal(t, token.GetMaskedKey(), returned.Key)
		})
	}
}

func TestInternallyCreatedTokenUsesDefaultGroup(t *testing.T) {
	setupTokenControllerTestDB(t)
	// Registration uses the model's Insert method rather than AddToken.
	token := model.Token{UserId: 7, Key: "registration-key", Group: "auto", CrossGroupRetry: true}
	require.NoError(t, token.Insert())
	stored, err := model.GetTokenByIds(token.Id, 7)
	require.NoError(t, err)
	assert.Equal(t, "default", stored.Group)
	assert.False(t, stored.CrossGroupRetry)
}
