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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { getUserQuotaDates } from '@/features/dashboard/api'
import { useModelStatCardsConfig } from '@/features/dashboard/hooks/use-dashboard-config'
import {
  buildQueryParams,
  calculateDashboardStats,
  getDefaultDays,
} from '@/features/dashboard/lib'
import type {
  QuotaDataItem,
  DashboardFilters,
} from '@/features/dashboard/types'
import { toIntlLocale } from '@/i18n/languages'
import { formatCompactNumber, formatNumber, formatQuota } from '@/lib/format'
import { computeTimeRange } from '@/lib/time'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

interface LogStatCardsProps {
  filters?: DashboardFilters
  onDataUpdate?: (data: QuotaDataItem[], loading: boolean) => void
}

const MAX_INLINE_STAT_CHARS = 9

const STAT_TONES = [
  {
    surface: 'bg-info-container text-info-container-foreground',
    icon: 'text-info',
  },
  {
    surface: 'bg-success-container text-success-container-foreground',
    icon: 'text-success',
  },
  {
    surface: 'bg-warning-container text-warning-container-foreground',
    icon: 'text-warning',
  },
  {
    surface: 'bg-error-container text-error-container-foreground',
    icon: 'text-destructive',
  },
  {
    surface: 'bg-tertiary-container text-tertiary-container-foreground',
    icon: 'text-tertiary',
  },
] as const

function formatStatNumber(value: number, locale: Intl.LocalesArgument) {
  const fullValue = formatNumber(value, locale)
  const displayValue =
    fullValue.length > MAX_INLINE_STAT_CHARS
      ? formatCompactNumber(value, locale)
      : fullValue

  return {
    displayValue,
    fullValue,
  }
}

export function LogStatCards(props: LogStatCardsProps) {
  const { i18n } = useTranslation()
  const statCardsConfig = useModelStatCardsConfig()
  const user = useAuthStore((state) => state.auth.user)
  const isAdmin = !!(user?.role && user.role >= 10)
  const [stats, setStats] = useState<{
    totalQuota: number
    totalCount: number
    totalTokens: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [timeRangeMinutes, setTimeRangeMinutes] = useState(0)

  const { filters, onDataUpdate } = props

  useEffect(() => {
    const abortController = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    setError(false)
    onDataUpdate?.([], true)

    const timeRange = computeTimeRange(
      getDefaultDays(filters?.time_granularity),
      filters?.start_timestamp,
      filters?.end_timestamp
    )
    const timeDiff = (timeRange.end_timestamp - timeRange.start_timestamp) / 60
    setTimeRangeMinutes(timeDiff)

    getUserQuotaDates(buildQueryParams(timeRange, filters), isAdmin)
      .then((res) => {
        if (abortController.signal.aborted) return
        const data = res?.data || []
        setStats(calculateDashboardStats(data))
        onDataUpdate?.(data, false)
        setLoading(false)
      })
      .catch(() => {
        if (abortController.signal.aborted) return
        setStats(null)
        setError(true)
        onDataUpdate?.([], false)
        setLoading(false)
      })

    return () => {
      abortController.abort()
    }
  }, [filters, isAdmin, onDataUpdate])

  const adaptedStats = {
    rpm: stats?.totalCount ?? 0,
    quota: stats?.totalQuota ?? 0,
    tpm: stats?.totalTokens ?? 0,
  }

  const items = statCardsConfig.map((config) => {
    const rawValue = config.getValue(adaptedStats, timeRangeMinutes)
    const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
    const formatted =
      config.key === 'quota'
        ? {
            displayValue: formatQuota(rawValue),
            fullValue: formatQuota(rawValue),
          }
        : formatStatNumber(rawValue, locale)

    return {
      title: config.title,
      value: formatted.displayValue,
      fullValue: formatted.fullValue,
      icon: config.icon,
    }
  })

  return (
    <div className='grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5'>
      {items.map((it, idx) => {
        const Icon = it.icon
        const tone = STAT_TONES[idx % STAT_TONES.length]
        let content

        if (loading) {
          content = <Skeleton className='mt-4 h-8 w-24 bg-current/10' />
        } else if (error) {
          content = (
            <div className='mt-4 font-mono text-2xl font-semibold tabular-nums sm:text-[1.75rem]'>
              --
            </div>
          )
        } else {
          content = (
            <div
              className='mt-4 max-w-full truncate font-mono text-2xl font-semibold tabular-nums sm:text-[1.75rem]'
              title={it.fullValue}
            >
              {it.value}
            </div>
          )
        }

        return (
          <div
            key={it.title}
            className={cn(
              'min-h-28 min-w-0 rounded-2xl px-4 py-4 sm:min-h-32 sm:px-5 sm:py-5',
              tone.surface,
              idx === items.length - 1 &&
                items.length % 2 !== 0 &&
                'col-span-2 sm:col-span-1'
            )}
          >
            <div className='flex min-w-0 items-center gap-3'>
              <Icon
                className={cn('size-5 shrink-0', tone.icon)}
                aria-hidden='true'
              />
              <div className='min-w-0 text-sm leading-5 font-semibold'>
                {it.title}
              </div>
            </div>
            {content}
          </div>
        )
      })}
    </div>
  )
}
