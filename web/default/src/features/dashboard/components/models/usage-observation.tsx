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
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

import { GameIcon } from '@/components/game-ui/game-icon'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserQuotaDates } from '@/features/dashboard/api'
import {
  aggregateObservation,
  observationQueryRanges,
} from '@/features/dashboard/lib/usage-observation'
import { formatCompactNumber, formatNumber, formatQuota } from '@/lib/format'
import { getStartOfDay } from '@/lib/time'
import { useAuthStore } from '@/stores/auth-store'

interface UsageObservationProps {
  isAdmin: boolean
  username?: string
}

const RING_CIRCUMFERENCE = 2 * Math.PI * 107

export function UsageObservation(props: UsageObservationProps) {
  const { t } = useTranslation()
  const userId = useAuthStore((state) => state.auth.user?.id)
  const [dayStart, setDayStart] = useState(() => getStartOfDay().getTime())
  const nextDay = new Date(dayStart)
  nextDay.setDate(nextDay.getDate() + 1)
  const nextDayStart = nextDay.getTime()

  // Change calendar buckets at local midnight, including after sleep or a
  // timezone change. This schedules one rollover, not a data-polling loop.
  useEffect(() => {
    const updateDay = () => setDayStart(getStartOfDay().getTime())
    const timer = window.setTimeout(
      updateDay,
      Math.max(1, nextDayStart - Date.now())
    )
    window.addEventListener('focus', updateDay)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', updateDay)
    }
  }, [nextDayStart])

  const query = useQuery({
    queryKey: [
      'dashboard',
      'usage-observation',
      userId,
      props.isAdmin,
      props.username,
      dayStart,
    ],
    queryFn: async () => {
      const observedAt = Date.now()
      const ranges = observationQueryRanges(new Date(observedAt))
      const responses = await Promise.all(
        ranges.map((range) =>
          getUserQuotaDates(
            {
              ...range,
              ...(props.username ? { username: props.username } : {}),
            },
            props.isAdmin
          )
        )
      )
      if (responses.some((response) => !response.success)) {
        throw new Error('Usage data unavailable')
      }
      return {
        rows: responses.flatMap((response) => response.data ?? []),
        observedAt,
      }
    },
    staleTime: 60_000,
    refetchInterval: false,
  })
  const observation = useMemo(
    () =>
      aggregateObservation(
        query.data?.rows ?? [],
        new Date(query.data?.observedAt ?? dayStart)
      ),
    [query.data, dayStart]
  )
  const ready = !query.isPending && !query.isError
  const todayShare =
    observation.weekCalls > 0
      ? observation.todayCalls / observation.weekCalls
      : 0
  const difference =
    observation.yesterdayCalls > 0
      ? ((observation.todayCalls - observation.yesterdayCalls) /
          observation.yesterdayCalls) *
        100
      : null
  const differenceDisplay =
    difference === null
      ? '—'
      : `${difference >= 0 ? '+' : ''}${difference.toFixed(1)}%`

  return (
    <div className='usage-observation' aria-busy={query.isPending}>
      <div className='usage-observation-top'>
        <section className='usage-meter usage-panel' aria-label={t('Calls')}>
          <h3 className='usage-panel-title'>
            <GameIcon name='energy' />
            {t('Calls')}
          </h3>
          <div className='usage-meter-dial'>
            <svg viewBox='0 0 240 240' aria-hidden='true'>
              <circle className='usage-meter-track' cx='120' cy='120' r='107' />
              <circle
                className='usage-meter-fill'
                cx='120'
                cy='120'
                r='107'
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - todayShare)}
              />
            </svg>
            <div className='usage-meter-readout'>
              <span>{t("Today's Requests")}</span>
              {query.isPending ? (
                <Skeleton className='h-12 w-28' />
              ) : (
                <strong>
                  {ready ? formatNumber(observation.todayCalls) : '—'}
                </strong>
              )}
              <span
                className='usage-meter-change'
                data-negative={difference !== null && difference < 0}
              >
                {t('Compared with yesterday')} {ready ? differenceDisplay : '—'}
              </span>
            </div>
          </div>
          <div className='usage-meter-costs'>
            <div>
              {t('Today’s cost')}{' '}
              <span>{ready ? formatQuota(observation.todayQuota) : '—'}</span>
            </div>
            <div>
              {t("This month's total")}{' '}
              <span>{ready ? formatQuota(observation.monthQuota) : '—'}</span>
            </div>
          </div>
        </section>

        <section
          className='usage-week usage-panel'
          aria-label={t('Last 7 days')}
        >
          <div className='usage-panel-heading'>
            <h3 className='usage-panel-title'>
              <GameIcon name='chart' />
              {t('Last 7 days')}
            </h3>
            <span>{t('Requests')}</span>
          </div>
          <div className='usage-week-bars'>
            {observation.days.map((day, index) => (
              <div
                className='usage-week-day'
                key={day.timestamp}
                title={`${new Date(day.timestamp).toLocaleDateString()} · ${ready ? formatNumber(day.count) : '—'}`}
              >
                <div className='usage-week-bar-area'>
                  <div
                    className='usage-week-column'
                    style={
                      {
                        '--usage-bar-ratio': ready
                          ? day.count / observation.maxDayCalls
                          : 0,
                      } as CSSProperties
                    }
                  >
                    <span className='usage-week-value'>
                      {ready ? formatCompactNumber(day.count) : '—'}
                    </span>
                    <div
                      className='usage-week-bar'
                      data-current={index === observation.days.length - 1}
                    />
                  </div>
                </div>
                <span className='usage-week-label'>{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          className='usage-by-model usage-panel'
          aria-label={t('By model')}
        >
          <h3 className='usage-panel-title'>
            <GameIcon name='brain' />
            {t('By model')}
          </h3>
          <div className='usage-model-list'>
            {observation.models.map((model) => (
              <div className='usage-model-row' key={model.name}>
                <div className='usage-model-label'>
                  <span title={model.name}>{model.name || t('Unknown')}</span>
                  <span>{formatNumber(model.count)}</span>
                </div>
                <div className='usage-model-track'>
                  <div
                    style={{
                      width: `${observation.weekCalls > 0 ? (model.count / observation.weekCalls) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {query.isPending && <Skeleton className='h-28 w-full' />}
            {ready && observation.models.length === 0 && (
              <p className='usage-empty'>{t('No data available')}</p>
            )}
            {query.isError && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => void query.refetch()}
              >
                {t('Retry')}
              </Button>
            )}
          </div>
        </section>
      </div>

      <section
        className='usage-heat usage-panel'
        aria-label={t('Today’s distribution')}
      >
        <div className='usage-panel-heading'>
          <h3 className='usage-panel-title'>
            <GameIcon name='time-1' />
            {t('Today’s distribution')}
          </h3>
          <span>{t('Each cell is 1 hour · Color indicates call density')}</span>
        </div>
        <div className='usage-heat-grid'>
          {observation.hours.map((hour) => (
            <div
              className='usage-heat-hour'
              key={hour.hour}
              title={`${String(hour.hour).padStart(2, '0')}:00 · ${ready ? formatNumber(hour.count) : '—'}`}
            >
              <div
                className='usage-heat-cell'
                style={
                  {
                    '--usage-heat-opacity':
                      ready && hour.count > 0
                        ? 0.15 + (hour.count / observation.maxHourCalls) * 0.7
                        : 0,
                  } as CSSProperties
                }
              />
              <span>{String(hour.hour).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
