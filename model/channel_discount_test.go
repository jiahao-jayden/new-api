package model

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestChannelDiscountValidationThroughChannelSave(t *testing.T) {
	for _, raw := range []string{`{"billing_discount":0}`, `{"billing_discount":-1}`, `{"billing_discount":1.1}`, `{"billing_discount":"0.3"}`} {
		channel := Channel{OtherSettings: raw}
		assert.Error(t, channel.ValidateSettings())
	}
	for _, raw := range []string{"", `{}`, `{"billing_discount":null}`, `{"billing_discount":0.3}`} {
		channel := Channel{OtherSettings: raw}
		assert.NoError(t, channel.ValidateSettings())
	}
}

func TestChannelDiscountRangesRespectAccessAndEnabledState(t *testing.T) {
	truncateTables(t)
	channels := []Channel{
		{Id: 8101, Key: "test", Status: common.ChannelStatusEnabled, OtherSettings: `{"billing_discount":0.3}`},
		{Id: 8102, Key: "test", Status: common.ChannelStatusEnabled, OtherSettings: `{"billing_discount":0.5}`},
		{Id: 8103, Key: "test", Status: common.ChannelStatusEnabled, OtherSettings: `{"billing_discount":0.1}`},
		{Id: 8104, Key: "test", Status: common.ChannelStatusManuallyDisabled, OtherSettings: `{"billing_discount":0.2}`},
		{Id: 8105, Key: "test", Status: common.ChannelStatusEnabled},
	}
	require.NoError(t, DB.Create(&channels).Error)
	abilities := []Ability{
		{ChannelId: 8101, Model: "claude", Group: "default", Enabled: true},
		{ChannelId: 8101, Model: "claude", Group: "another", Enabled: true},
		{ChannelId: 8102, Model: "claude", Group: "default", Enabled: true},
		{ChannelId: 8103, Model: "claude", Group: "private", Enabled: true},
		{ChannelId: 8104, Model: "claude", Group: "default", Enabled: true},
		{ChannelId: 8103, Model: "claude", Group: "default", Enabled: false},
		{ChannelId: 8105, Model: "gpt", Group: "default", Enabled: true},
	}
	require.NoError(t, DB.Create(&abilities).Error)
	ranges, err := GetChannelDiscountRanges(map[string]string{"default": "", "another": ""})
	require.NoError(t, err)
	assert.Equal(t, ChannelDiscountRange{Min: 0.3, Max: 0.5, Count: 2}, ranges["claude"])
	assert.Equal(t, ChannelDiscountRange{Min: 1, Max: 1, Count: 1}, ranges["gpt"])
	ranges, err = GetChannelDiscountRanges(nil)
	require.NoError(t, err)
	assert.Empty(t, ranges)
}
