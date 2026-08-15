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
import { ChevronRight, Copy } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'

import { DEFAULT_TOKEN_UNIT } from '../constants'
import {
  getDynamicDisplayGroupRatio,
  getDynamicPricingSummary,
} from '../lib/dynamic-price'
import { isTokenBasedModel } from '../lib/model-helpers'
import { getModelPriceSummary } from '../lib/price-summary'
import type { PricingModel, TokenUnit } from '../types'

export interface ModelCardProps {
  model: PricingModel
  onClick: () => void
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
  selectedGroup?: string
}

export const ModelCard = memo(function ModelCard(props: ModelCardProps) {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()
  const tokenUnit = props.tokenUnit ?? DEFAULT_TOKEN_UNIT
  const priceRate = props.priceRate ?? 1
  const usdExchangeRate = props.usdExchangeRate ?? 1
  const showRechargePrice = props.showRechargePrice ?? false
  const isTokenBased = isTokenBasedModel(props.model)
  const tokenUnitLabel = tokenUnit === 'K' ? '1K' : '1M'
  const modelIconKey = props.model.icon || props.model.vendor_icon
  const modelIcon = modelIconKey ? getLobeIcon(modelIconKey, 28) : null
  const initial = props.model.model_name?.charAt(0).toUpperCase() || '?'
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
        groupRatioMultiplier: getDynamicDisplayGroupRatio(
          props.model,
          props.selectedGroup
        ),
      })
    : null

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    copyToClipboard(props.model.model_name || '')
  }

  let priceContent: React.ReactNode
  if (dynamicSummary?.isSpecialExpression) {
    priceContent = (
      <div className='min-w-0'>
        <span className='text-warning text-xs font-medium'>
          {t('Special billing expression')}
        </span>
        <code className='text-muted-foreground/70 mt-1 line-clamp-1 block font-mono text-[11px] break-all'>
          {dynamicSummary.rawExpression}
        </code>
      </div>
    )
  } else if (dynamicSummary && dynamicSummary.primaryEntries.length > 0) {
    priceContent = (
      <div className='space-y-1.5'>
        {dynamicSummary.primaryEntries.map((entry) => (
          <div
            key={entry.key}
            className='grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-2 tabular-nums'
          >
            <span className='text-muted-foreground truncate text-xs leading-5 font-medium'>
              {t(entry.shortLabel)}
            </span>
            <span className='text-foreground min-w-0 text-[15px] leading-5 font-semibold whitespace-nowrap'>
              {entry.formatted}
              <span className='text-muted-foreground ml-1 text-[11px] font-medium'>
                /{tokenUnitLabel}
              </span>
            </span>
          </div>
        ))}
      </div>
    )
  } else if (dynamicSummary) {
    priceContent = (
      <div className='text-muted-foreground text-xs'>
        {t('Dynamic Pricing')}
      </div>
    )
  } else if (isTokenBased) {
    priceContent = (
      <div className='space-y-1.5'>
        <div className='grid min-w-0 grid-cols-[2.75rem_max-content_minmax(0,1fr)] items-baseline gap-x-2 tabular-nums'>
          <span className='text-muted-foreground text-xs leading-5 font-medium'>
            {t('Input')}
          </span>
          <span className='text-foreground text-[15px] leading-5 font-semibold whitespace-nowrap'>
            {priceSummary.finalInputPrice}
            <span className='text-muted-foreground ml-1 text-[11px] font-medium'>
              /{tokenUnitLabel}
            </span>
          </span>
          {priceSummary.officialInputPrice &&
            priceSummary.officialInputPrice !==
              priceSummary.finalInputPrice && (
              <span className='text-muted-foreground/65 truncate text-xs leading-5'>
                {priceSummary.officialInputPrice}
              </span>
            )}
        </div>
        <div className='grid min-w-0 grid-cols-[2.75rem_max-content_minmax(0,1fr)] items-baseline gap-x-2 tabular-nums'>
          <span className='text-muted-foreground text-xs leading-5 font-medium'>
            {t('Output')}
          </span>
          <span className='text-foreground text-[15px] leading-5 font-semibold whitespace-nowrap'>
            {priceSummary.finalOutputPrice}
            <span className='text-muted-foreground ml-1 text-[11px] font-medium'>
              /{tokenUnitLabel}
            </span>
          </span>
          {priceSummary.officialOutputPrice &&
            priceSummary.officialOutputPrice !==
              priceSummary.finalOutputPrice && (
              <span className='text-muted-foreground/65 truncate text-xs leading-5'>
                {priceSummary.officialOutputPrice}
              </span>
            )}
        </div>
        {priceSummary.discountPercent ? (
          <span className='text-success block text-[11px] leading-4 whitespace-nowrap tabular-nums'>
            {t('Save {{percent}}%', {
              percent: priceSummary.discountPercent,
            })}
          </span>
        ) : null}
      </div>
    )
  } else {
    priceContent = (
      <div className='space-y-1'>
        <div className='flex min-w-0 flex-wrap items-baseline gap-x-2 tabular-nums'>
          <span className='text-muted-foreground text-xs leading-5 font-medium'>
            {t('Per Request')}
          </span>
          <span className='text-foreground text-[15px] leading-5 font-semibold whitespace-nowrap'>
            {priceSummary.finalRequestPrice}
            <span className='text-muted-foreground ml-1 text-[11px] font-medium'>
              / {t('request')}
            </span>
          </span>
          {priceSummary.officialRequestPrice &&
            priceSummary.officialRequestPrice !==
              priceSummary.finalRequestPrice && (
              <span className='text-muted-foreground/65 text-xs leading-5 whitespace-nowrap'>
                {priceSummary.officialRequestPrice}
              </span>
            )}
        </div>
        {priceSummary.discountPercent ? (
          <span className='text-success block text-[11px] leading-4 whitespace-nowrap tabular-nums'>
            {t('Save {{percent}}%', {
              percent: priceSummary.discountPercent,
            })}
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <article
      className={cn(
        'group bg-surface-container-low relative flex min-h-[220px] flex-col rounded-2xl p-4 transition-colors',
        'hover:bg-surface-container focus-within:bg-surface-container'
      )}
    >
      <header className='flex min-w-0 items-start gap-2.5'>
        <div className='flex size-9 shrink-0 items-center justify-center'>
          {modelIcon || (
            <span className='text-primary text-base font-bold'>{initial}</span>
          )}
        </div>

        <div className='min-w-0 flex-1 pt-0.5'>
          <div className='flex min-w-0 items-start gap-1'>
            <h3
              className='text-foreground line-clamp-2 min-w-0 text-base leading-5 font-medium [overflow-wrap:anywhere]'
              title={props.model.model_name}
            >
              {props.model.model_name}
            </h3>
            <Button
              type='button'
              variant='ghost'
              size='icon-xs'
              onClick={handleCopy}
              className='text-muted-foreground -mt-0.5 shrink-0'
              title={t('Copy')}
              aria-label={t('Copy')}
            >
              <Copy />
            </Button>
          </div>
          {props.model.vendor_name && (
            <p className='text-muted-foreground mt-0.5 truncate text-[13px] leading-5 font-medium'>
              {props.model.vendor_name}
            </p>
          )}
        </div>
      </header>

      <p className='text-muted-foreground mt-4 line-clamp-2 min-h-10 flex-1 text-[13px] leading-5'>
        {props.model.description || t('No description available.')}
      </p>

      <footer className='border-outline-variant/35 mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t pt-3'>
        <div className='min-w-0'>{priceContent}</div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={props.onClick}
          className='text-primary hover:bg-primary-container hover:text-primary-container-foreground self-center'
        >
          {t('Details')}
          <ChevronRight data-icon='inline-end' />
        </Button>
      </footer>
    </article>
  )
})
