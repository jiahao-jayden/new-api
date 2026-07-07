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
import { QUOTA_TYPE_VALUES } from '../constants'
import type { PricingModel, TokenUnit } from '../types'
import {
  formatPriceValue,
  getMinGroupRatio,
  getRequestPriceUSD,
  getTokenPriceUSD,
  stripTrailingZeros,
} from './price'

export type ModelPriceSummary = {
  finalInputPrice?: string
  finalOutputPrice?: string
  finalRequestPrice?: string
  officialInputPrice?: string
  officialOutputPrice?: string
  officialRequestPrice?: string
  discountPercent?: number
}

function getDisplayGroupRatio(model: PricingModel): number {
  const enableGroups = Array.isArray(model.enable_groups)
    ? model.enable_groups
    : []
  return getMinGroupRatio(enableGroups, model.group_ratio || {})
}

function getDiscountPercent(finalPrice: number, officialPrice: number): number {
  if (
    !Number.isFinite(finalPrice) ||
    !Number.isFinite(officialPrice) ||
    officialPrice <= 0 ||
    finalPrice >= officialPrice
  ) {
    return 0
  }
  return Math.round((1 - finalPrice / officialPrice) * 100)
}

function formatSummaryPrice(price: number): string | undefined {
  if (!Number.isFinite(price)) return undefined
  return stripTrailingZeros(formatPriceValue(price))
}

export function getModelPriceSummary(
  model: PricingModel,
  tokenUnit: TokenUnit,
  showRechargePrice = false,
  priceRate = 1,
  usdExchangeRate = 1
): ModelPriceSummary {
  const groupRatio = getDisplayGroupRatio(model)

  if (model.quota_type === QUOTA_TYPE_VALUES.REQUEST) {
    const finalPrice = getRequestPriceUSD(
      model,
      groupRatio,
      showRechargePrice,
      priceRate,
      usdExchangeRate
    )
    const officialPrice = getRequestPriceUSD(
      model,
      1,
      showRechargePrice,
      priceRate,
      usdExchangeRate
    )

    return {
      finalRequestPrice: formatSummaryPrice(finalPrice),
      officialRequestPrice: formatSummaryPrice(officialPrice),
      discountPercent: getDiscountPercent(finalPrice, officialPrice),
    }
  }

  const finalInputPrice = getTokenPriceUSD(
    model,
    'input',
    tokenUnit,
    groupRatio,
    showRechargePrice,
    priceRate,
    usdExchangeRate
  )
  const finalOutputPrice = getTokenPriceUSD(
    model,
    'output',
    tokenUnit,
    groupRatio,
    showRechargePrice,
    priceRate,
    usdExchangeRate
  )
  const officialInputPrice = getTokenPriceUSD(
    model,
    'input',
    tokenUnit,
    1,
    showRechargePrice,
    priceRate,
    usdExchangeRate
  )
  const officialOutputPrice = getTokenPriceUSD(
    model,
    'output',
    tokenUnit,
    1,
    showRechargePrice,
    priceRate,
    usdExchangeRate
  )

  return {
    finalInputPrice: formatSummaryPrice(finalInputPrice),
    finalOutputPrice: formatSummaryPrice(finalOutputPrice),
    officialInputPrice: formatSummaryPrice(officialInputPrice),
    officialOutputPrice: formatSummaryPrice(officialOutputPrice),
    discountPercent: Math.max(
      getDiscountPercent(finalInputPrice, officialInputPrice),
      getDiscountPercent(finalOutputPrice, officialOutputPrice)
    ),
  }
}
