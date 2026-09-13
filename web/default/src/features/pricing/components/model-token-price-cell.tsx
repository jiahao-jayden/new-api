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
import { useTranslation } from 'react-i18next'

import { DEFAULT_TOKEN_UNIT } from '../constants'
import { getChannelDiscountRange } from '../lib/channel-discount'
import { getDynamicPricingSummary } from '../lib/dynamic-price'
import { isTokenBasedModel } from '../lib/model-helpers'
import { getModelPriceSummary } from '../lib/price-summary'
import type { PricingModel } from '../types'
import type { PricingColumnsOptions } from './pricing-columns'

export function ModelTokenPriceCell(props: {
  model: PricingModel
  kind: 'input' | 'output'
  options: PricingColumnsOptions
}) {
  const { t } = useTranslation()
  const tokenUnit = props.options.tokenUnit ?? DEFAULT_TOKEN_UNIT
  const priceRate = props.options.priceRate ?? 1
  const usdExchangeRate = props.options.usdExchangeRate ?? 1
  const dynamic = getDynamicPricingSummary(props.model, {
    tokenUnit,
    priceRate,
    usdExchangeRate,
    showRechargePrice: props.options.showRechargePrice ?? false,
    discountMultiplier: getChannelDiscountRange(props.model).min,
  })
  if (dynamic) {
    const field = props.kind === 'input' ? 'inputPrice' : 'outputPrice'
    const entry = dynamic.entries.find((item) => item.field === field)
    return (
      <span className={`pencil-price-${props.kind}`}>
        {entry?.formatted ?? t('Dynamic Pricing')}
      </span>
    )
  }
  const price = getModelPriceSummary(
    props.model,
    tokenUnit,
    props.options.showRechargePrice,
    priceRate,
    usdExchangeRate,
    props.options.selectedGroup
  )
  if (!isTokenBasedModel(props.model)) {
    return (
      <span className={`pencil-price-${props.kind}`}>
        {props.kind === 'input' ? price.finalRequestPrice : '—'}
        {props.kind === 'input' && (
          <span className='pencil-price-unit'> / {t('request')}</span>
        )}
      </span>
    )
  }
  return (
    <span className={`pencil-price-${props.kind}`}>
      {props.kind === 'input' ? price.finalInputPrice : price.finalOutputPrice}
    </span>
  )
}
