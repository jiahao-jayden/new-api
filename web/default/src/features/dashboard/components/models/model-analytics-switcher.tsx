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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { QuotaDataItem } from '@/features/dashboard/types'
import type { TimeGranularity } from '@/lib/time'

import { ConsumptionDistributionChart } from './consumption-distribution-chart'
import { ModelCharts } from './model-charts'

type ModelAnalyticsView = 'consumption' | 'calls'

interface ModelAnalyticsSwitcherProps {
  data: QuotaDataItem[]
  loading?: boolean
  timeGranularity?: TimeGranularity
}

export function ModelAnalyticsSwitcher(props: ModelAnalyticsSwitcherProps) {
  const { t } = useTranslation()
  const [activeView, setActiveView] =
    useState<ModelAnalyticsView>('consumption')

  const viewSwitcher = (
    <Tabs
      value={activeView}
      onValueChange={(value) => {
        if (value === 'consumption' || value === 'calls') {
          setActiveView(value)
        }
      }}
    >
      <TabsList className='h-8 max-w-full overflow-x-auto'>
        <TabsTrigger value='consumption' className='px-3 text-xs'>
          {t('Quota Distribution')}
        </TabsTrigger>
        <TabsTrigger value='calls' className='px-3 text-xs'>
          {t('Model Call Analytics')}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )

  if (activeView === 'calls') {
    return (
      <ModelCharts
        data={props.data}
        loading={props.loading}
        timeGranularity={props.timeGranularity}
        defaultChartTab='trend'
        showChartControls={false}
        headerActions={viewSwitcher}
      />
    )
  }

  return (
    <ConsumptionDistributionChart
      data={props.data}
      loading={props.loading}
      timeGranularity={props.timeGranularity}
      defaultChartType='bar'
      showChartControls={false}
      headerActions={viewSwitcher}
    />
  )
}
