package middleware

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/i18n"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPlaygroundDefaultRoutingAndAdministratorGroupDebugging(t *testing.T) {
	previousDB := model.DB
	previousDBType := common.MainDatabaseType()
	previousLogDBType := common.LogDatabaseType()
	previousSQLitePath := common.SQLitePath
	previousMaster := common.IsMasterNode
	previousMemoryCache := common.MemoryCacheEnabled
	previousRedis := common.RedisEnabled
	previousGroups := setting.UserUsableGroups2JSONString()
	t.Cleanup(func() {
		model.DB = previousDB
		common.SetDatabaseTypes(previousDBType, previousLogDBType)
		common.SQLitePath = previousSQLitePath
		common.IsMasterNode = previousMaster
		common.MemoryCacheEnabled = previousMemoryCache
		common.RedisEnabled = previousRedis
		require.NoError(t, setting.UpdateUserUsableGroupsByJSONString(previousGroups))
	})
	t.Setenv("SQL_DSN", "")
	t.Setenv("LOG_SQL_DSN", "")
	common.SQLitePath = filepath.Join(t.TempDir(), "playground.db")
	common.IsMasterNode = false
	common.MemoryCacheEnabled = false
	common.RedisEnabled = false
	require.NoError(t, model.InitDB())
	require.NoError(t, i18n.Init())
	db := model.DB
	sqlDB, err := db.DB()
	require.NoError(t, err)
	t.Cleanup(func() { require.NoError(t, sqlDB.Close()) })
	require.NoError(t, db.AutoMigrate(&model.Channel{}, &model.Ability{}))
	for id, group := range []string{"default", "debug"} {
		channel := model.Channel{
			Id: id + 1, Type: constant.ChannelTypeOpenAI, Status: common.ChannelStatusEnabled,
			Name: group, Key: "local-test-only", Group: group, Models: "routing-test-model",
		}
		require.NoError(t, db.Create(&channel).Error)
		require.NoError(t, db.Create(&model.Ability{
			Group: group, Model: "routing-test-model", ChannelId: channel.Id,
			Enabled: true, Priority: common.GetPointer(int64(0)),
		}).Error)
	}

	for _, test := range []struct {
		name         string
		role         int
		group        string
		denyDefault  bool
		wantGroup    string
		wantChannel  int
		wantHTTPCode int
	}{
		{name: "ordinary user omitted group", role: common.RoleCommonUser, wantGroup: "default", wantChannel: 1, wantHTTPCode: 200},
		{name: "ordinary user old group ignored", role: common.RoleCommonUser, group: "debug", wantGroup: "default", wantChannel: 1, wantHTTPCode: 200},
		{name: "ordinary user auto ignored", role: common.RoleCommonUser, group: "auto", wantGroup: "default", wantChannel: 1, wantHTTPCode: 200},
		{name: "administrator debug retained", role: common.RoleAdminUser, group: "debug", wantGroup: "debug", wantChannel: 2, wantHTTPCode: 200},
		{name: "default permission still enforced", role: common.RoleCommonUser, group: "debug", denyDefault: true, wantHTTPCode: 403},
	} {
		t.Run(test.name, func(t *testing.T) {
			groups := `{"default":"Default","debug":"Debug"}`
			if test.denyDefault {
				groups = `{"debug":"Debug"}`
			}
			require.NoError(t, setting.UpdateUserUsableGroupsByJSONString(groups))
			gin.SetMode(gin.TestMode)
			router := gin.New()
			router.Use(func(c *gin.Context) {
				c.Set("role", test.role)
				common.SetContextKey(c, constant.ContextKeyUserGroup, "legacy-user")
				common.SetContextKey(c, constant.ContextKeyUsingGroup, "legacy-user")
			})
			called := false
			router.POST("/pg/chat/completions", Distribute(), func(c *gin.Context) {
				called = true
				assert.Equal(t, test.wantGroup, common.GetContextKeyString(c, constant.ContextKeyUsingGroup))
				assert.Equal(t, test.wantGroup, common.GetContextKeyString(c, constant.ContextKeyTokenGroup))
				assert.Equal(t, test.wantChannel, common.GetContextKeyInt(c, constant.ContextKeyChannelId))
				c.Status(http.StatusOK)
			})
			payload, err := common.Marshal(map[string]string{"model": "routing-test-model", "group": test.group})
			require.NoError(t, err)
			recorder := httptest.NewRecorder()
			request := httptest.NewRequest(http.MethodPost, "/pg/chat/completions", bytes.NewReader(payload))
			request.Header.Set("Content-Type", "application/json")
			router.ServeHTTP(recorder, request)
			assert.Equal(t, test.wantHTTPCode, recorder.Code, recorder.Body.String())
			assert.Equal(t, test.wantHTTPCode == http.StatusOK, called)
		})
	}
}
