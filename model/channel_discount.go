package model

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
)

type ChannelDiscountRange struct {
	Min   float64
	Max   float64
	Count int
}

// GetChannelDiscountRanges aggregates only enabled routes accessible to the user.
// No channel IDs, credentials, or private settings are exposed in the catalog.
func GetChannelDiscountRanges(usableGroups map[string]string) (map[string]ChannelDiscountRange, error) {
	result := make(map[string]ChannelDiscountRange)
	if len(usableGroups) == 0 {
		return result, nil
	}
	groups := make([]string, 0, len(usableGroups))
	for group := range usableGroups {
		groups = append(groups, group)
	}
	var routes []struct {
		Model     string
		ChannelID int
		Settings  string
	}
	err := DB.Table("abilities").
		Select("DISTINCT abilities.model, abilities.channel_id, channels.settings").
		Joins("JOIN channels ON channels.id = abilities.channel_id").
		Where("abilities.enabled = ? AND channels.status = ?", true, common.ChannelStatusEnabled).
		Where("abilities."+commonGroupCol+" IN ?", groups).
		Scan(&routes).Error
	if err != nil {
		return nil, err
	}
	for _, route := range routes {
		var settings dto.ChannelOtherSettings
		if route.Settings != "" {
			if err := common.UnmarshalJsonStr(route.Settings, &settings); err != nil {
				return nil, err
			}
		}
		discount := settings.GetBillingDiscount()
		rangeInfo, exists := result[route.Model]
		if !exists {
			rangeInfo = ChannelDiscountRange{Min: discount, Max: discount}
		} else {
			rangeInfo.Min = min(rangeInfo.Min, discount)
			rangeInfo.Max = max(rangeInfo.Max, discount)
		}
		rangeInfo.Count++
		result[route.Model] = rangeInfo
	}
	return result, nil
}
