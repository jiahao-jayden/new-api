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
import type { QuotaDataItem } from '../types'

const MAX_QUERY_SECONDS = 30 * 24 * 60 * 60

export function observationQueryRanges(now: Date) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)
  const start = Math.floor(
    Math.min(monthStart.getTime(), weekStart.getTime()) / 1000
  )
  const end = Math.floor(now.getTime() / 1000)
  const ranges = []
  // The self-usage endpoint permits at most 30 days per request. Ranges are
  // inclusive, so start the next chunk one second after the previous end.
  for (let cursor = start; cursor <= end; cursor += MAX_QUERY_SECONDS) {
    ranges.push({
      start_timestamp: cursor,
      end_timestamp: Math.min(end, cursor + MAX_QUERY_SECONDS - 1),
      default_time: 'hour',
    })
  }
  return ranges
}

export function aggregateObservation(data: QuotaDataItem[], now: Date) {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const month = new Date(today.getFullYear(), today.getMonth(), 1)
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (6 - index))
    const end = new Date(date)
    end.setDate(end.getDate() + 1)
    return {
      timestamp: date.getTime(),
      end: end.getTime(),
      label: String(date.getDate()).padStart(2, '0'),
      count: 0,
    }
  })
  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
  const models = new Map<string, number>()
  let todayCalls = 0
  let yesterdayCalls = 0
  let todayQuota = 0
  let monthQuota = 0

  for (const item of data) {
    const timestamp = Number(item.created_at) * 1000
    if (!Number.isFinite(timestamp) || timestamp > now.getTime()) continue
    const count = Math.max(0, Number(item.count) || 0)
    const quota = Math.max(0, Number(item.quota) || 0)
    if (timestamp >= month.getTime()) monthQuota += quota
    const day = days.find(
      (entry) => timestamp >= entry.timestamp && timestamp < entry.end
    )
    if (day) {
      day.count += count
      const model = item.model_name || ''
      models.set(model, (models.get(model) ?? 0) + count)
    }
    if (timestamp >= today.getTime()) {
      todayCalls += count
      todayQuota += quota
      hours[new Date(timestamp).getHours()].count += count
    } else if (timestamp >= yesterday.getTime()) {
      yesterdayCalls += count
    }
  }

  return {
    days,
    hours,
    models: [...models]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    todayCalls,
    yesterdayCalls,
    todayQuota,
    monthQuota,
    weekCalls: days.reduce((total, day) => total + day.count, 0),
    maxDayCalls: Math.max(1, ...days.map((day) => day.count)),
    maxHourCalls: Math.max(1, ...hours.map((hour) => hour.count)),
  }
}
