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
import { PieChart as PieChartIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useThemeCustomization } from '@/context/theme-customization-provider'
import {
  DEFAULT_TIME_GRANULARITY,
  MODEL_ANALYTICS_CHART_OPTIONS,
} from '@/features/dashboard/constants'
import { processChartData } from '@/features/dashboard/lib'
import type {
  ModelAnalyticsChartTab,
  QuotaDataItem,
} from '@/features/dashboard/types'
import { useThemeRadiusPx } from '@/lib/theme-radius'
import type { TimeGranularity } from '@/lib/time'
import { useChartTheme } from '@/lib/use-chart-theme'
import { VCHART_OPTION } from '@/lib/vchart'

type ChartSpecKey = 'spec_model_line' | 'spec_pie' | 'spec_rank_bar'

const CHART_SPEC_KEYS: Record<ModelAnalyticsChartTab, ChartSpecKey> = {
  trend: 'spec_model_line',
  proportion: 'spec_pie',
  top: 'spec_rank_bar',
}

interface ModelChartsProps {
  data: QuotaDataItem[]
  loading?: boolean
  timeGranularity?: TimeGranularity
  defaultChartTab?: ModelAnalyticsChartTab
  showChartControls?: boolean
  headerActions?: ReactNode
}

export function ModelCharts(props: ModelChartsProps) {
  const { t } = useTranslation()
  const { resolvedTheme, themeReady, themeRevision } = useChartTheme()
  const { customization } = useThemeCustomization()
  const chartRadius = useThemeRadiusPx(
    '--radius-md',
    `${customization.preset}:${customization.radius}`
  )
  const [activeTab, setActiveTab] = useState<ModelAnalyticsChartTab>(
    props.defaultChartTab ?? 'trend'
  )
  const timeGranularity = props.timeGranularity ?? DEFAULT_TIME_GRANULARITY

  useEffect(() => {
    if (props.defaultChartTab) setActiveTab(props.defaultChartTab)
  }, [props.defaultChartTab])

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

  const spec = chartData[CHART_SPEC_KEYS[activeTab]]
  const specType = typeof spec?.type === 'string' ? spec.type : activeTab
  const chartKey = [
    activeTab,
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
          <PieChartIcon
            className='text-primary size-5 shrink-0'
            aria-hidden='true'
          />
          <div className='truncate text-base font-semibold'>
            {t('Model Call Analytics')}
          </div>
          <span className='text-muted-foreground ml-1 shrink-0 text-sm tabular-nums'>
            {t('Total:')} {chartData.totalCountDisplay}
          </span>
        </div>

        {props.headerActions ??
          (props.showChartControls !== false ? (
            <div className='bg-muted/70 no-scrollbar inline-flex h-9 w-full overflow-x-auto overflow-y-hidden rounded-xl p-1 sm:w-auto'>
              {MODEL_ANALYTICS_CHART_OPTIONS.map((tab) => (
                <button
                  key={tab.value}
                  type='button'
                  onClick={() => setActiveTab(tab.value)}
                  className={`shrink-0 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                    activeTab === tab.value
                      ? 'bg-card text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(tab.labelKey)}
                </button>
              ))}
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
