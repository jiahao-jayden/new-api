package dto

import (
	"math"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestChannelBillingDiscountValidation(t *testing.T) {
	for _, tc := range []struct {
		name  string
		value *float64
		valid bool
		want  float64
	}{
		{"legacy full price", nil, true, 1},
		{"full price", common.GetPointer(1.0), true, 1},
		{"three tenths", common.GetPointer(0.3), true, 0.3},
		{"fractional tenths", common.GetPointer(0.03), true, 0.03},
		{"zero", common.GetPointer(0.0), false, 1},
		{"negative", common.GetPointer(-0.3), false, 1},
		{"markup", common.GetPointer(1.01), false, 1},
		{"nan", common.GetPointer(math.NaN()), false, 1},
		{"infinite", common.GetPointer(math.Inf(1)), false, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			settings := ChannelOtherSettings{BillingDiscount: tc.value}
			if tc.valid {
				require.NoError(t, settings.ValidateBillingDiscount())
			} else {
				require.Error(t, settings.ValidateBillingDiscount())
			}
			assert.Equal(t, tc.want, settings.GetBillingDiscount())
		})
	}
}
