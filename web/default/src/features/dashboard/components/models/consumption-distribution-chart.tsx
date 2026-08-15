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
import { VChart } from '@visactor/react-vchart'
import { AreaChart, BarChart3, WalletCards } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useThemeCustomization } from '@/context/theme-customization-provider'
import {
  CONSUMPTION_DISTRIBUTION_CHART_OPTIONS,
  DEFAULT_TIME_GRANULARITY,
} from '@/features/dashboard/constants'
import { processChartData } from '@/features/dashboard/lib'
import type {
  ConsumptionDistributionChartType,
  QuotaDataItem,
} from '@/features/dashboard/types'
import { useThemeRadiusPx } from '@/lib/theme-radius'
import type { TimeGranularity } from '@/lib/time'
import { useChartTheme } from '@/lib/use-chart-theme'
import { VCHART_OPTION } from '@/lib/vchart'

interface ConsumptionDistributionChartProps {
  data: QuotaDataItem[]
  loading?: boolean
  timeGranularity?: TimeGranularity
  defaultChartType?: ConsumptionDistributionChartType
  showChartControls?: boolean
  headerActions?: ReactNode
}

const CHART_TYPE_ICONS: Record<
  ConsumptionDistributionChartType,
  typeof BarChart3
> = {
  bar: BarChart3,
  area: AreaChart,
}

export function ConsumptionDistributionChart(
  props: ConsumptionDistributionChartProps
) {
  const { t } = useTranslation()
  const { resolvedTheme, themeReady, themeRevision } = useChartTheme()
  const { customization } = useThemeCustomization()
  const chartRadius = useThemeRadiusPx(
    '--radius-md',
    `${customization.preset}:${customization.radius}`
  )
  const [chartType, setChartType] = useState<ConsumptionDistributionChartType>(
    props.defaultChartType ?? 'bar'
  )
  const timeGranularity = props.timeGranularity ?? DEFAULT_TIME_GRANULARITY

  useEffect(() => {
    if (props.defaultChartType) setChartType(props.defaultChartType)
  }, [props.defaultChartType])

  const chartData = useMemo(() => {
    void themeRevision
    return processChartData(
      props.loading ? [] : props.data,
      timeGranularity,
      t,
      chartRadius
    )
  }, [
    props.data,
    props.loading,
    timeGranularity,
    t,
    chartRadius,
    themeRevision,
  ])
  const spec = chartType === 'bar' ? chartData.spec_line : chartData.spec_area
  const specType = typeof spec?.type === 'string' ? spec.type : chartType
  const chartKey = [
    chartType,
    specType,
    props.loading ? 'loading' : 'ready',
    props.data.length,
    resolvedTheme,
    customization.preset,
    themeRevision,
  ].join('-')

  return (
    <section className='bg-card overflow-hidden rounded-2xl'>
      <div className='flex w-full flex-col gap-3 px-4 pt-5 sm:px-6 sm:pt-6 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex min-w-0 items-center gap-3'>
          <WalletCards
            className='text-primary size-5 shrink-0'
            aria-hidden='true'
          />
          <div className='truncate text-base font-semibold'>
            {t('Quota Distribution')}
          </div>
          <span className='text-muted-foreground ml-1 shrink-0 text-sm tabular-nums'>
            {t('Total:')} {chartData.totalQuotaDisplay}
          </span>
        </div>

        {props.headerActions ??
          (props.showChartControls !== false ? (
            <div className='bg-muted/70 no-scrollbar inline-flex h-9 w-full overflow-x-auto overflow-y-hidden rounded-xl p-1 sm:w-auto'>
              {CONSUMPTION_DISTRIBUTION_CHART_OPTIONS.map((item) => {
                const Icon = CHART_TYPE_ICONS[item.value]
                return (
                  <button
                    key={item.value}
                    type='button'
                    onClick={() => setChartType(item.value)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                      chartType === item.value
                        ? 'bg-card text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className='size-3.5' />
                    {t(item.labelKey)}
                  </button>
                )
              })}
            </div>
          ) : null)}
      </div>

      <div className='h-80 px-2 pt-2 pb-3 sm:h-[26rem] sm:px-4 sm:pt-3 sm:pb-5'>
        {themeReady && spec && (
          <VChart
            key={chartKey}
            spec={{
              ...spec,
              theme: resolvedTheme === 'dark' ? 'dark' : 'light',
              background: 'transparent',
            }}
            option={VCHART_OPTION}
          />
        )}
      </div>
    </section>
  )
}
