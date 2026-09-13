package service

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestConsoleGroupsRespectDefaultAccessAndKeepAdminDiagnostics(t *testing.T) {
	previousGroups := setting.UserUsableGroups2JSONString()
	special := ratio_setting.GetGroupRatioSetting().GroupSpecialUsableGroup
	previousSpecial := special.MarshalJSONString()
	t.Cleanup(func() {
		require.NoError(t, setting.UpdateUserUsableGroupsByJSONString(previousGroups))
		var restored map[string]map[string]string
		require.NoError(t, common.UnmarshalJsonStr(previousSpecial, &restored))
		special.Clear()
		special.AddAll(restored)
	})
	require.NoError(t, setting.UpdateUserUsableGroupsByJSONString(`{"default":"Default","private":"Private"}`))
	special.Clear()
	assert.Equal(t, map[string]string{"default": "Default"}, GetConsoleUsableGroups("default", false))
	assert.Equal(t, map[string]string{"default": "Default", "private": "Private"}, GetConsoleUsableGroups("default", true))
	special.AddAll(map[string]map[string]string{"restricted": {"-:default": "Restricted"}})
	assert.Empty(t, GetConsoleUsableGroups("restricted", false), "Hiding groups must not grant access to an explicitly restricted route")
}
