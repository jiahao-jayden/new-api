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
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter,
  Grid2X2,
  Table2,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import {
  VIEW_MODES,
  getSortLabels,
  type SortOption,
  type ViewMode,
} from '../constants'
import type { PricingModel, PricingVendor, TokenUnit } from '../types'
import { PricingSidebar } from './pricing-sidebar'

type SegmentOption = {
  value: string
  label?: string
  icon?: React.ComponentType<{ className?: string }>
  tooltip?: string
}

export interface PricingToolbarProps {
  filteredCount: number
  totalCount?: number
  sortBy: string
  onSortChange: (value: string) => void
  tokenUnit: TokenUnit
  onTokenUnitChange: (value: TokenUnit) => void
  showRechargePrice: boolean
  onRechargePriceChange: (value: boolean) => void
  viewMode: ViewMode
  onViewModeChange: (value: ViewMode) => void
  quotaTypeFilter: string
  endpointTypeFilter: string
  vendorFilter: string
  groupFilter: string
  tagFilter: string
  onQuotaTypeChange: (value: string) => void
  onEndpointTypeChange: (value: string) => void
  onVendorChange: (value: string) => void
  onGroupChange: (value: string) => void
  onTagChange: (value: string) => void
  vendors: PricingVendor[]
  groups: string[]
  groupRatios?: Record<string, number>
  showGroupRatios?: boolean
  tags: string[]
  models: PricingModel[]
  hasActiveFilters: boolean
  activeFilterCount: number
  onClearFilters: () => void
}

function SegmentedControl(props: {
  options: SegmentOption[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}) {
  return (
    <div
      role='group'
      aria-label={props.ariaLabel}
      className='bg-surface-container-high inline-flex h-9 items-center rounded-xl p-1'
    >
      {props.options.map((option) => {
        const Icon = option.icon
        const isActive = option.value === props.value
        const button = (
          <button
            key={option.value}
            type='button'
            onClick={() => props.onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              'inline-flex h-full items-center justify-center rounded-lg text-xs font-medium transition-colors',
              Icon && !option.label ? 'w-7' : 'gap-1.5 px-3',
              isActive
                ? 'bg-primary-container text-primary-container-foreground'
                : 'text-surface-variant-foreground hover:bg-surface-container-highest hover:text-foreground'
            )}
          >
            {Icon && <Icon className='size-3.5' />}
            {option.label}
          </button>
        )

        if (!option.tooltip) {
          return button
        }

        return (
          <Tooltip key={option.value}>
            <TooltipTrigger render={button} />
            <TooltipContent side='bottom' className='text-xs'>
              {option.tooltip}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

export function PricingToolbar(props: PricingToolbarProps) {
  const { t } = useTranslation()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const sortLabels = getSortLabels(t)
  const { onTokenUnitChange, onViewModeChange, onRechargePriceChange } = props

  const handleTokenUnitChange = useCallback(
    (value: string) => onTokenUnitChange(value as TokenUnit),
    [onTokenUnitChange]
  )

  const handleViewModeChange = useCallback(
    (value: string) => onViewModeChange(value as ViewMode),
    [onViewModeChange]
  )

  const handleRechargePriceChange = useCallback(
    (value: string) => onRechargePriceChange(value === 'recharge'),
    [onRechargePriceChange]
  )

  return (
    <Collapsible
      open={filtersOpen}
      onOpenChange={setFiltersOpen}
      className='bg-surface-container-low rounded-2xl p-3 sm:p-4'
    >
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex items-center gap-2'>
          <CollapsibleTrigger
            render={
              <Button
                type='button'
                variant='secondary'
                size='sm'
                aria-expanded={filtersOpen}
                className='h-9'
              />
            }
          >
            <Filter data-icon='inline-start' />
            {t('Filter')}
            {props.activeFilterCount > 0 && (
              <Badge className='ml-0.5 size-5 justify-center p-0 text-[10px]'>
                {props.activeFilterCount}
              </Badge>
            )}
            <ChevronDown
              data-icon='inline-end'
              className={cn(
                'transition-transform duration-[420ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
                filtersOpen && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>

          <div className='text-muted-foreground flex items-baseline gap-1 text-sm'>
            <span className='text-foreground font-semibold tabular-nums'>
              {props.filteredCount.toLocaleString()}
            </span>
            <span>{props.filteredCount === 1 ? t('model') : t('models')}</span>
            {props.hasActiveFilters && props.totalCount && (
              <span className='text-muted-foreground/60 text-xs'>
                / {props.totalCount.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <SegmentedControl
              options={[
                { value: 'standard', label: t('Standard') },
                { value: 'recharge', label: t('Recharge') },
              ]}
              value={props.showRechargePrice ? 'recharge' : 'standard'}
              onChange={handleRechargePriceChange}
              ariaLabel={t('Price display mode')}
            />
            <SegmentedControl
              options={[
                { value: 'M', label: '/1M' },
                { value: 'K', label: '/1K' },
              ]}
              value={props.tokenUnit}
              onChange={handleTokenUnitChange}
              ariaLabel={t('Token unit')}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-8 px-3 text-xs'
                />
              }
            >
              <ArrowUpDown data-icon='inline-start' />
              <span>{sortLabels[props.sortBy as SortOption] || t('Sort')}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-44'>
              {Object.entries(sortLabels).map(([value, label]) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => props.onSortChange(value)}
                  className='gap-2'
                >
                  <Check
                    className={cn(
                      'size-4 shrink-0',
                      props.sortBy === value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <SegmentedControl
            options={[
              {
                value: VIEW_MODES.CARD,
                icon: Grid2X2,
                tooltip: t('Card view'),
              },
              {
                value: VIEW_MODES.TABLE,
                icon: Table2,
                tooltip: t('Table view'),
              },
            ]}
            value={props.viewMode}
            onChange={handleViewModeChange}
            ariaLabel={t('View mode')}
          />
        </div>
      </div>

      <CollapsibleContent className='h-(--collapsible-panel-height) overflow-hidden transition-[height,opacity] duration-[420ms] ease-[cubic-bezier(0.2,0,0,1)] data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0 motion-reduce:transition-none'>
        <div className='pt-3'>
          <PricingSidebar
            quotaTypeFilter={props.quotaTypeFilter}
            endpointTypeFilter={props.endpointTypeFilter}
            vendorFilter={props.vendorFilter}
            groupFilter={props.groupFilter}
            tagFilter={props.tagFilter}
            onQuotaTypeChange={props.onQuotaTypeChange}
            onEndpointTypeChange={props.onEndpointTypeChange}
            onVendorChange={props.onVendorChange}
            onGroupChange={props.onGroupChange}
            onTagChange={props.onTagChange}
            vendors={props.vendors}
            groups={props.groups}
            groupRatios={props.groupRatios}
            showGroupRatios={props.showGroupRatios}
            tags={props.tags}
            models={props.models}
            hasActiveFilters={props.hasActiveFilters}
            onClearFilters={props.onClearFilters}
            embedded
            className='bg-surface-container p-3 sm:p-4'
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
