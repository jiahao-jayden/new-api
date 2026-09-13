package controller

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/ratio_setting"

	"github.com/gin-gonic/gin"
)

func filterPricingByUsableGroups(pricing []model.Pricing, usableGroup map[string]string) []model.Pricing {
	if len(pricing) == 0 {
		return pricing
	}
	if len(usableGroup) == 0 {
		return []model.Pricing{}
	}

	filtered := make([]model.Pricing, 0, len(pricing))
	for _, item := range pricing {
		if common.StringsContains(item.EnableGroup, "all") {
			filtered = append(filtered, item)
			continue
		}
		for _, group := range item.EnableGroup {
			if _, ok := usableGroup[group]; ok {
				filtered = append(filtered, item)
				break
			}
		}
	}
	return filtered
}

func GetPricing(c *gin.Context) {
	pricing := model.GetPricing()
	userId, exists := c.Get("id")
	usableGroup := map[string]string{}
	groupRatio := map[string]float64{}
	for s := range ratio_setting.GetGroupRatioCopy() {
		// Groups still control routing permissions, not the selling price.
		groupRatio[s] = 1
	}
	var group string
	if exists {
		user, err := model.GetUserCache(userId.(int))
		if err == nil {
			group = user.Group
		}
	}

	isAdmin := exists && model.IsAdmin(c.GetInt("id"))
	usableGroup = service.GetConsoleUsableGroups(group, isAdmin)
	autoGroups := []string{}
	if isAdmin {
		autoGroups = service.GetUserAutoGroup(group)
	}
	pricing = filterPricingByUsableGroups(pricing, usableGroup)
	ranges, err := model.GetChannelDiscountRanges(usableGroup)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	// GetPricing is shared cache data: never write user-scoped availability into it.
	pricing = append([]model.Pricing(nil), pricing...)
	if !isAdmin {
		available := pricing[:0]
		for _, item := range pricing {
			// Legacy "all" metadata and stale catalog entries do not establish a
			// callable default route. Use the current enabled-channel lookup.
			if ranges[item.ModelName].Count > 0 {
				available = append(available, item)
			}
		}
		pricing = available
	}
	for i := range pricing {
		if !isAdmin {
			pricing[i].EnableGroup = []string{model.DefaultTokenGroup}
		}
		rangeInfo, ok := ranges[pricing[i].ModelName]
		pricing[i].ChannelDiscountMin = 1
		pricing[i].ChannelDiscountMax = 1
		if ok {
			pricing[i].ChannelDiscountMin = rangeInfo.Min
			pricing[i].ChannelDiscountMax = rangeInfo.Max
			pricing[i].ChannelCount = rangeInfo.Count
		}
	}
	// check groupRatio contains usableGroup
	for group := range ratio_setting.GetGroupRatioCopy() {
		if _, ok := usableGroup[group]; !ok {
			delete(groupRatio, group)
		}
	}

	c.JSON(200, gin.H{
		"success":            true,
		"data":               pricing,
		"vendors":            model.GetVendors(),
		"group_ratio":        groupRatio,
		"usable_group":       usableGroup,
		"supported_endpoint": model.GetSupportedEndpointMap(),
		"auto_groups":        autoGroups,
		"pricing_version":    "channel-discount-v1",
	})
}

func ResetModelRatio(c *gin.Context) {
	defaultStr := ratio_setting.DefaultModelRatio2JSONString()
	err := model.UpdateOption("ModelRatio", defaultStr)
	if err != nil {
		c.JSON(200, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	err = ratio_setting.UpdateModelRatioByJSONString(defaultStr)
	if err != nil {
		c.JSON(200, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"success": true,
		"message": "重置模型倍率成功",
	})
}
