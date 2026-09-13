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
import { memo, useId } from 'react'
import { useTranslation } from 'react-i18next'

import { GameIcon } from '@/components/game-ui/game-icon'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'
import { useCurrencyPreference } from '@/stores/currency-preference-store'

import { DEFAULT_TOKEN_UNIT } from '../constants'
import {
  getChannelDiscountLabel,
  getChannelDiscountRange,
} from '../lib/channel-discount'
import { getDynamicPricingSummary } from '../lib/dynamic-price'
import { isTokenBasedModel } from '../lib/model-helpers'
import { getModelPriceSummary } from '../lib/price-summary'
import type { PricingModel, TokenUnit } from '../types'
import { ModelPerfBadge, type ModelPerfBadgeData } from './model-perf-badge'

export interface ModelCardProps {
  model: PricingModel
  onClick: () => void
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
  selectedGroup?: string
  perf?: ModelPerfBadgeData
  selected?: boolean
}

export const ModelCard = memo(function ModelCard(props: ModelCardProps) {
  const { t } = useTranslation()
  useCurrencyPreference()
  const { copyToClipboard } = useCopyToClipboard()
  const nameId = useId()
  const tokenUnit = props.tokenUnit ?? DEFAULT_TOKEN_UNIT
  const priceRate = props.priceRate ?? 1
  const usdExchangeRate = props.usdExchangeRate ?? 1
  const showRechargePrice = props.showRechargePrice ?? false
  const isTokenBased = isTokenBasedModel(props.model)
  const discount = getChannelDiscountRange(props.model)
  const discountLabel = getChannelDiscountLabel(props.model, t)
  const tokenUnitLabel = tokenUnit === 'K' ? '1K' : '1M'
  const isDynamicPricing =
    props.model.billing_mode === 'tiered_expr' &&
    Boolean(props.model.billing_expr)
  const priceSummary = getModelPriceSummary(
    props.model,
    tokenUnit,
    showRechargePrice,
    priceRate,
    usdExchangeRate,
    props.selectedGroup
  )
  const dynamicSummary = isDynamicPricing
    ? getDynamicPricingSummary(props.model, {
        tokenUnit,
        showRechargePrice,
        priceRate,
        usdExchangeRate,
        discountMultiplier: discount.min,
      })
    : null
  const originalDynamicSummary = isDynamicPricing
    ? getDynamicPricingSummary(props.model, {
        tokenUnit,
        showRechargePrice,
        priceRate,
        usdExchangeRate,
        discountMultiplier: 1,
      })
    : null
  let originalPrices: (string | undefined)[]
  if (originalDynamicSummary) {
    originalPrices = originalDynamicSummary.primaryEntries.map(
      (entry) => entry.formatted
    )
  } else if (isTokenBased) {
    originalPrices = [
      priceSummary.officialInputPrice,
      priceSummary.officialOutputPrice,
    ]
  } else {
    originalPrices = [priceSummary.officialRequestPrice]
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    copyToClipboard(props.model.model_name || '')
  }

  let prices: { label: string; value: string; unit: string }[] = []
  let pricingNote: React.ReactNode
  if (dynamicSummary?.isSpecialExpression) {
    pricingNote = (
      <div className='pencil-model-expression'>
        <span>{t('Special billing expression')}</span>
        <code>{dynamicSummary.rawExpression}</code>
      </div>
    )
  } else if (dynamicSummary && dynamicSummary.primaryEntries.length > 0) {
    prices = dynamicSummary.primaryEntries.map((entry) => ({
      label: t(entry.shortLabel),
      value: entry.formatted,
      unit: tokenUnitLabel,
    }))
    pricingNote = <span>{t('Dynamic Pricing')}</span>
  } else if (dynamicSummary) {
    pricingNote = <span>{t('Dynamic Pricing')}</span>
  } else if (isTokenBased) {
    prices = [
      {
        label: t('Input'),
        value: priceSummary.finalInputPrice ?? '—',
        unit: tokenUnitLabel,
      },
      {
        label: t('Output'),
        value: priceSummary.finalOutputPrice ?? '—',
        unit: tokenUnitLabel,
      },
    ]
  } else {
    prices = [
      {
        label: t('Price'),
        value: priceSummary.finalRequestPrice ?? '—',
        unit: t('request'),
      },
    ]
  }

  return (
    <article
      className={cn(
        'pencil-model-card game-surface',
        props.selected
          ? 'game-surface-list-selected is-selected'
          : 'game-surface-panel'
      )}
      data-model-product={props.model.vendor_name}
    >
      <button
        type='button'
        onClick={props.onClick}
        className='pencil-model-select'
        aria-pressed={props.selected}
        aria-labelledby={nameId}
        aria-controls='pricing-model-inspector'
      />
      <div className='game-model-product-face'>
        {discountLabel && (discount.min < 1 || discount.count > 1) && (
          <span className='pencil-model-saving'>{discountLabel}</span>
        )}
        <div className='pencil-model-card-heading'>
          <span className='game-model-emblem' aria-hidden='true'>
            <GameIcon name='brain' className='size-6' />
          </span>
          <div className='pencil-model-identity'>
            <h3 id={nameId} className='pencil-model-name'>
              {props.model.model_name}
            </h3>
            <div className='pencil-model-meta'>
              {props.model.vendor_name && (
                <span data-model-vendor={props.model.vendor_name}>
                  {props.model.vendor_name}
                </span>
              )}
              {props.model.context_length != null &&
                props.model.context_length > 0 && (
                  <span>
                    {t('Context')} {props.model.context_length.toLocaleString()}
                  </span>
                )}
            </div>
          </div>
          <button
            type='button'
            onClick={handleCopy}
            className='pencil-model-copy'
            title={t('Copy')}
            aria-label={t('Copy')}
          >
            <GameIcon name='layer-1' className='size-5' />
          </button>
        </div>
      </div>
      {Boolean(
        prices.length || pricingNote || originalPrices.some(Boolean)
      ) && (
        <div className='game-model-price-seat'>
          {prices.length > 0 && (
            <dl className='pencil-model-prices'>
              {prices.map((price) => (
                <div key={price.label} className='pencil-model-price'>
                  <dt>{price.label}</dt>
                  <dd>
                    <strong>{price.value}</strong>
                    <span>/ {price.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {Boolean(pricingNote || originalPrices.some(Boolean)) && (
            <div className='pencil-model-price-note'>
              {pricingNote}
              {originalPrices.some(Boolean) && (
                <span className='pencil-model-official'>
                  {t('Official')} {originalPrices.join(' / ')}
                </span>
              )}
            </div>
          )}
        </div>
      )}
      {props.model.description?.trim() && (
        <p className='pencil-model-description'>{props.model.description}</p>
      )}

      <ModelPerfBadge perf={props.perf} className='pencil-model-performance' />
    </article>
  )
})
