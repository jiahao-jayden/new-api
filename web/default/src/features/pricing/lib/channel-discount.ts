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
import type { TFunction } from 'i18next'

import type { PricingModel } from '../types'

export type ChannelDiscountRange = {
  min: number
  max: number
  count: number
}

/** Channel discounts are supplied by the API after checking route availability. */
export function getChannelDiscountRange(
  model: PricingModel
): ChannelDiscountRange {
  const min = model.channel_discount_min
  const max = model.channel_discount_max
  const validMin =
    typeof min === 'number' && Number.isFinite(min) && min > 0 && min <= 1
  const validMax =
    typeof max === 'number' && Number.isFinite(max) && max > 0 && max <= 1
  const count = model.channel_count
  if (count === 0 || !validMin || !validMax || min > max) {
    return { min: 1, max: 1, count: 0 }
  }
  return {
    min,
    max,
    count:
      typeof count === 'number' && Number.isInteger(count) && count > 0
        ? count
        : 1,
  }
}

export function getChannelDiscountLabel(
  model: PricingModel,
  t: TFunction,
  detailed = false
): string {
  const range = getChannelDiscountRange(model)
  if (range.count === 0) return ''
  const values = {
    discount: Number((range.min * 10).toPrecision(12)),
    percent: Number((range.min * 100).toPrecision(12)),
    maxDiscount: Number((range.max * 10).toPrecision(12)),
    maxPercent: Number((range.max * 100).toPrecision(12)),
  }
  if (detailed && range.min !== range.max) {
    return t('Original-price discount range', values)
  }
  if (!detailed && range.count > 1) {
    return t('Lowest original-price discount', values)
  }
  return t('Original-price discount', values)
}
