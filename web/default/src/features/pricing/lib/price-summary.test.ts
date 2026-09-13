/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'

import { createInstance } from 'i18next'

import { formatBillingCurrencyFromUSD } from '@/lib/currency'
import { useAuthStore } from '@/stores/auth-store'
import { useCurrencyPreferenceStore } from '@/stores/currency-preference-store'
import {
  DEFAULT_CURRENCY_CONFIG,
  useSystemConfigStore,
} from '@/stores/system-config-store'

import { FILTER_ALL, QUOTA_TYPE_VALUES, SORT_OPTIONS } from '../constants'
import type { PricingModel } from '../types'
import {
  getChannelDiscountLabel,
  getChannelDiscountRange,
} from './channel-discount'
import {
  getDynamicPriceEntries,
  getDynamicPricingSummary,
  getDynamicPricingTiers,
} from './dynamic-price'
import { sortModels } from './filters'
import { getTokenPriceUSD, formatPriceValue, stripTrailingZeros } from './price'
import { getModelPriceSummary } from './price-summary'

function pricingModel(overrides: Partial<PricingModel> = {}): PricingModel {
  return {
    id: 1,
    model_name: 'pricing-regression-model',
    quota_type: QUOTA_TYPE_VALUES.TOKEN,
    model_ratio: 5,
    completion_ratio: 3,
    enable_groups: ['standard', 'discounted'],
    group_ratio: { standard: 0.8, discounted: 0.1 },
    channel_discount_min: 0.3,
    channel_discount_max: 0.5,
    channel_count: 2,
    ...overrides,
  }
}

function display(price: number): string {
  return stripTrailingZeros(formatPriceValue(price))
}

function dynamicDisplay(price: number): string {
  return formatBillingCurrencyFromUSD(price, {
    digitsLarge: 4,
    digitsSmall: 6,
    abbreviate: false,
  })
}

describe('channel-priced catalog and model-detail contract', () => {
  const originalConfig = useSystemConfigStore.getState().config
  const originalAuth = useAuthStore.getState().auth
  const originalPreferences = useCurrencyPreferenceStore.getState().preferences

  before(() => {
    useAuthStore.setState({
      auth: {
        ...originalAuth,
        user: { id: 101, username: 'pricing-test', role: 1 },
      },
    })
    useCurrencyPreferenceStore.setState({ preferences: { '101': 'USD' } })
    useSystemConfigStore.setState({
      config: {
        ...originalConfig,
        currency: { ...DEFAULT_CURRENCY_CONFIG, usdExchangeRate: 7 },
      },
    })
  })

  after(() => {
    useSystemConfigStore.setState({ config: originalConfig })
    useAuthStore.setState({ auth: originalAuth })
    useCurrencyPreferenceStore.setState({ preferences: originalPreferences })
  })

  test('prices the lowest and highest available channels without multiplying legacy groups', () => {
    for (const group of [
      undefined,
      FILTER_ALL,
      'standard',
      'discounted',
      'unavailable',
    ]) {
      assert.deepEqual(
        getModelPriceSummary(pricingModel(), 'M', false, 1, 1, group),
        {
          finalInputPrice: display(3),
          finalOutputPrice: display(9),
          maxInputPrice: display(5),
          maxOutputPrice: display(15),
          officialInputPrice: display(10),
          officialOutputPrice: display(30),
          discountPercent: 70,
        }
      )
    }
  })

  test('single channel has one final price and leaves original prices unchanged', () => {
    const model = pricingModel({
      channel_count: 1,
      channel_discount_min: 0.3,
      channel_discount_max: 0.3,
    })
    const original = structuredClone(model)
    const result = getModelPriceSummary(model, 'M')
    assert.equal(result.finalInputPrice, display(3))
    assert.equal(result.maxInputPrice, result.finalInputPrice)
    assert.equal(result.officialInputPrice, display(10))
    assert.deepEqual(model, original)
  })

  test('invalid or unavailable channel metadata never invents a discount', () => {
    for (const overrides of [
      { channel_count: 0 },
      {
        channel_discount_min: undefined,
        channel_discount_max: undefined,
        channel_count: undefined,
      },
      { channel_discount_min: 0 },
      { channel_discount_min: -0.3 },
      { channel_discount_min: Number.NaN },
      { channel_discount_max: Infinity },
      { channel_discount_max: 1.1 },
      { channel_discount_min: 0.9, channel_discount_max: 0.3 },
    ]) {
      const result = getModelPriceSummary(pricingModel(overrides), 'M')
      assert.equal(result.finalInputPrice, display(10))
      assert.equal(result.maxInputPrice, display(10))
      assert.equal(result.discountPercent, 0)
    }
    const free = getModelPriceSummary(pricingModel({ model_ratio: 0 }), 'M')
    assert.equal(free.finalInputPrice, display(0))
    assert.equal(free.discountPercent, 0)
  })

  test('uses channel count for preview labels and actual range for details', async () => {
    const i18n = createInstance()
    await i18n.init({
      lng: 'zh',
      resources: {
        zh: {
          translation: {
            'Original-price discount': '{{discount}} 折',
            'Lowest original-price discount': '最低 {{discount}} 折',
            'Original-price discount range':
              '原价的 {{discount}} 折到 {{maxDiscount}} 折',
          },
        },
      },
    })
    assert.equal(getChannelDiscountLabel(pricingModel(), i18n.t), '最低 3 折')
    assert.equal(
      getChannelDiscountLabel(pricingModel(), i18n.t, true),
      '原价的 3 折到 5 折'
    )
    const single = pricingModel({ channel_count: 1, channel_discount_max: 0.3 })
    assert.equal(getChannelDiscountLabel(single, i18n.t), '3 折')
    assert.equal(getChannelDiscountLabel(single, i18n.t, true), '3 折')
    assert.equal(
      getChannelDiscountLabel(
        pricingModel({ channel_discount_min: 0.01 }),
        i18n.t
      ),
      '最低 0.1 折'
    )
    assert.equal(
      getChannelDiscountLabel(pricingModel({ channel_count: 0 }), i18n.t),
      ''
    )
  })

  test('applies token units once to original prices and both channel extremes', () => {
    const result = getModelPriceSummary(pricingModel(), 'K')
    assert.equal(result.finalInputPrice, display(0.003))
    assert.equal(result.maxInputPrice, display(0.005))
    assert.equal(result.finalOutputPrice, display(0.009))
    assert.equal(result.maxOutputPrice, display(0.015))
    assert.equal(result.officialInputPrice, display(0.01))
    assert.equal(result.officialOutputPrice, display(0.03))
  })

  test('keeps request prices independent of token units and supports fractional discounts', () => {
    const model = pricingModel({
      quota_type: QUOTA_TYPE_VALUES.REQUEST,
      model_price: 0.8,
      channel_discount_min: 0.01,
    })
    for (const unit of ['M', 'K'] as const) {
      const result = getModelPriceSummary(model, unit)
      assert.equal(result.finalRequestPrice, display(0.008))
      assert.equal(result.maxRequestPrice, display(0.4))
      assert.equal(result.officialRequestPrice, display(0.8))
    }
  })

  test('converts original and discounted prices to CNY exactly once', () => {
    useCurrencyPreferenceStore.setState({ preferences: { '101': 'CNY' } })
    try {
      const result = getModelPriceSummary(pricingModel(), 'M')
      assert.equal(result.officialInputPrice, '¥70')
      assert.equal(result.finalInputPrice, '¥21')
      assert.equal(result.maxInputPrice, '¥35')
      assert.equal(result.officialOutputPrice, '¥210')
    } finally {
      useCurrencyPreferenceStore.setState({ preferences: { '101': 'USD' } })
    }
    const result = getModelPriceSummary(pricingModel(), 'M')
    assert.equal(result.officialInputPrice, '$10')
    assert.equal(result.finalInputPrice, '$3')
  })

  test('keeps free cache and audio prices distinct from missing metadata', () => {
    const model = pricingModel({
      completion_ratio: 0,
      cache_ratio: 0,
      create_cache_ratio: null,
      audio_ratio: 0,
      audio_completion_ratio: null,
    })
    assert.equal(getTokenPriceUSD(model, 'output', 'M'), 0)
    assert.equal(getTokenPriceUSD(model, 'cache', 'M'), 0)
    assert.equal(getTokenPriceUSD(model, 'audio_input', 'M'), 0)
    assert.ok(Number.isNaN(getTokenPriceUSD(model, 'create_cache', 'M')))
    assert.ok(Number.isNaN(getTokenPriceUSD(model, 'image', 'M')))
    assert.ok(Number.isNaN(getTokenPriceUSD(model, 'audio_output', 'M')))
    assert.ok(
      Math.abs(
        getTokenPriceUSD(pricingModel({ cache_ratio: 0.2 }), 'cache', 'M') - 0.6
      ) < Number.EPSILON
    )
  })

  test('dynamic tiers preserve originals and apply each channel discount once', () => {
    const model = pricingModel({
      billing_mode: 'tiered_expr',
      billing_expr:
        'len <= 200000 ? tier("standard", p * 10 + c * 30) : tier("long", p * 20 + c * 60 + cr * 2)',
    })
    const tiers = getDynamicPricingTiers(model)
    assert.equal(tiers.length, 2)
    const range = getChannelDiscountRange(model)
    const original = getDynamicPriceEntries(tiers[1], {
      tokenUnit: 'M',
      discountMultiplier: 1,
    })
    const minimum = getDynamicPriceEntries(tiers[1], {
      tokenUnit: 'M',
      discountMultiplier: range.min,
    })
    const maximum = getDynamicPriceEntries(tiers[1], {
      tokenUnit: 'M',
      discountMultiplier: range.max,
    })
    assert.deepEqual(
      original.map((entry) => entry.formatted),
      [dynamicDisplay(20), dynamicDisplay(60), dynamicDisplay(2)]
    )
    assert.deepEqual(
      minimum.map((entry) => entry.formatted),
      [dynamicDisplay(6), dynamicDisplay(18), dynamicDisplay(0.6)]
    )
    assert.deepEqual(
      maximum.map((entry) => entry.formatted),
      [dynamicDisplay(10), dynamicDisplay(30), dynamicDisplay(1)]
    )
    assert.equal(tiers[1].inputPrice, 20)
    assert.deepEqual(
      getDynamicPriceEntries(tiers[0], {
        tokenUnit: 'K',
        discountMultiplier: range.min,
      }).map((entry) => entry.formatted),
      [dynamicDisplay(0.003), dynamicDisplay(0.009)]
    )
  })

  test('does not fabricate a unit price for special dynamic expressions', () => {
    const model = pricingModel({
      billing_mode: 'tiered_expr',
      billing_expr: 'max(p * 3, 1)',
    })
    const result = getDynamicPricingSummary(model, {
      tokenUnit: 'M',
      discountMultiplier: 0.3,
    })
    assert.ok(result)
    assert.equal(result.isSpecialExpression, true)
    assert.equal(result.rawExpression, model.billing_expr)
    assert.deepEqual(result.entries, [])
  })

  test('sorts by lowest actual channel price rather than original or group prices', () => {
    const models = [
      pricingModel({ id: 1, model_ratio: 2 }),
      pricingModel({ id: 2, model_ratio: 10, channel_discount_min: 0.01 }),
    ]
    assert.deepEqual(
      sortModels(models, SORT_OPTIONS.PRICE_LOW).map((model) => model.id),
      [2, 1]
    )
    assert.deepEqual(
      sortModels(models, SORT_OPTIONS.PRICE_HIGH).map((model) => model.id),
      [1, 2]
    )
  })
})
