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

import { useCurrencyPreference } from '@/stores/currency-preference-store'

import {
  getChannelDiscountLabel,
  getChannelDiscountRange,
} from '../lib/channel-discount'
import { getDynamicPricingSummary } from '../lib/dynamic-price'
import { isTokenBasedModel } from '../lib/model-helpers'
import {
  formatPriceValue,
  getTokenPriceUSD,
  stripTrailingZeros,
} from '../lib/price'
import { getModelPriceSummary } from '../lib/price-summary'
import type { PriceType, PricingModel, TokenUnit } from '../types'

type PriceComparison = {
  key: string
  label: string
  value?: string
  maxValue?: string
  officialValue?: string
}

function PriceComparisonList(props: {
  prices: PriceComparison[]
  unit: string
  secondary?: boolean
}) {
  const { t } = useTranslation()
  if (props.prices.length === 0) return null

  return (
    <dl
      className={
        props.secondary
          ? 'pencil-detail-extra-prices'
          : 'pencil-model-prices pencil-detail-prices'
      }
    >
      {props.prices.map((price) => (
        <div
          key={price.key}
          className='pencil-model-price game-price-comparison'
        >
          <dt>{price.label}</dt>
          <dd>
            <strong>
              {price.value ?? '—'}
              {price.maxValue != null && price.maxValue !== price.value && (
                <> – {price.maxValue}</>
              )}
            </strong>
            {price.value != null && <span>/ {props.unit}</span>}
          </dd>
          {price.officialValue != null && (
            <dd className='pencil-detail-official-price'>
              <span>{t('Official')}</span>
              <span>
                {price.officialValue} / {props.unit}
              </span>
            </dd>
          )}
        </div>
      ))}
    </dl>
  )
}

export function ModelDetailsPricing(props: {
  model: PricingModel
  selectedGroup?: string
  priceRate: number
  usdExchangeRate: number
  tokenUnit: TokenUnit
  showRechargePrice: boolean
}) {
  const { t } = useTranslation()
  useCurrencyPreference()
  const discount = getChannelDiscountRange(props.model)
  const discountLabel = getChannelDiscountLabel(props.model, t, true)
  const tokenUnitLabel = props.tokenUnit === 'K' ? '1K' : '1M'
  const priceOptions = {
    tokenUnit: props.tokenUnit,
    showRechargePrice: props.showRechargePrice,
    priceRate: props.priceRate,
    usdExchangeRate: props.usdExchangeRate,
  }
  const dynamicSummary = getDynamicPricingSummary(props.model, {
    ...priceOptions,
    discountMultiplier: discount.min,
  })
  let primaryPrices: PriceComparison[] = []
  let secondaryPrices: PriceComparison[] = []
  let unit = tokenUnitLabel

  if (dynamicSummary) {
    // The full breakdown below retains unparseable expressions and tier rules.
    if (dynamicSummary.isSpecialExpression) {
      return discountLabel ? (
        <p className='game-model-discount-label text-sm'>{discountLabel}</p>
      ) : null
    }
    const officialSummary = getDynamicPricingSummary(props.model, {
      ...priceOptions,
      discountMultiplier: 1,
    })
    const officialPrices = new Map(
      officialSummary?.entries.map((entry) => [entry.key, entry.formatted])
    )
    const maxSummary = getDynamicPricingSummary(props.model, {
      ...priceOptions,
      discountMultiplier: discount.max,
    })
    const maxPrices = new Map(
      maxSummary?.entries.map((entry) => [entry.key, entry.formatted])
    )
    primaryPrices = dynamicSummary.primaryEntries.map((entry) => ({
      key: entry.key,
      label: t(entry.shortLabel),
      value: entry.formatted,
      maxValue: maxPrices.get(entry.key),
      officialValue: officialPrices.get(entry.key),
    }))
    secondaryPrices = dynamicSummary.secondaryEntries.map((entry) => ({
      key: entry.key,
      label: t(entry.shortLabel),
      value: entry.formatted,
      maxValue: maxPrices.get(entry.key),
      officialValue: officialPrices.get(entry.key),
    }))
  } else {
    const summary = getModelPriceSummary(
      props.model,
      props.tokenUnit,
      props.showRechargePrice,
      props.priceRate,
      props.usdExchangeRate,
      props.selectedGroup
    )
    if (isTokenBasedModel(props.model)) {
      primaryPrices = [
        {
          key: 'input',
          label: t('Input'),
          value: summary.finalInputPrice,
          maxValue: summary.maxInputPrice,
          officialValue: summary.officialInputPrice,
        },
        {
          key: 'output',
          label: t('Output'),
          value: summary.finalOutputPrice,
          maxValue: summary.maxOutputPrice,
          officialValue: summary.officialOutputPrice,
        },
      ]
      const extraPriceTypes: { type: PriceType; label: string }[] = [
        { type: 'cache', label: t('Cached input') },
        { type: 'create_cache', label: t('Cache write') },
        { type: 'image', label: t('Image input') },
        { type: 'audio_input', label: t('Audio input') },
        { type: 'audio_output', label: t('Audio output') },
      ]
      secondaryPrices = extraPriceTypes.flatMap((item) => {
        const price = getTokenPriceUSD(
          props.model,
          item.type,
          props.tokenUnit,
          discount.min,
          props.showRechargePrice,
          props.priceRate,
          props.usdExchangeRate
        )
        const officialPrice = getTokenPriceUSD(
          props.model,
          item.type,
          props.tokenUnit,
          1,
          props.showRechargePrice,
          props.priceRate,
          props.usdExchangeRate
        )
        if (!Number.isFinite(price) || !Number.isFinite(officialPrice)) {
          return []
        }
        return [
          {
            key: item.type,
            label: item.label,
            value: stripTrailingZeros(formatPriceValue(price)),
            maxValue: stripTrailingZeros(
              formatPriceValue(officialPrice * discount.max)
            ),
            officialValue: stripTrailingZeros(formatPriceValue(officialPrice)),
          },
        ]
      })
    } else {
      unit = t('request')
      primaryPrices = [
        {
          key: 'request',
          label: t('Per request'),
          value: summary.finalRequestPrice,
          maxValue: summary.maxRequestPrice,
          officialValue: summary.officialRequestPrice,
        },
      ]
    }
  }

  return (
    <div className='pencil-detail-pricing'>
      {discountLabel && (
        <p className='game-model-discount-label text-sm'>{discountLabel}</p>
      )}
      <PriceComparisonList prices={primaryPrices} unit={unit} />
      <PriceComparisonList prices={secondaryPrices} unit={unit} secondary />
    </div>
  )
}
