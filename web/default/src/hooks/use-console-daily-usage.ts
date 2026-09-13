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
import { useEffect, useState } from 'react'

import { getUserLogs } from '@/features/usage-logs/api'
import { LOG_TYPE_ENUM } from '@/features/usage-logs/constants'
import { getStartOfDay } from '@/lib/time'
import { useAuthStore } from '@/stores/auth-store'

/** Current user's recorded consume requests for the local calendar day.
 * Use the self-log count, whose timestamps retain seconds, instead of hourly
 * dashboard buckets. Admins also use /log/self; log entries never leave this query.
 */
export function useConsoleDailyUsage() {
  const userId = useAuthStore((state) => state.auth.user?.id)
  const [dayStart, setDayStart] = useState(() => getStartOfDay().getTime())
  const nextDay = new Date(dayStart)
  nextDay.setDate(nextDay.getDate() + 1)
  const nextDayStart = nextDay.getTime()
  const enabled = userId != null

  // One rollover timer per calendar day. Focus also catches a timezone change or
  // a sleeping tab, without polling the server while the console stays open.
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
    queryKey: ['console', 'daily-log-usage', userId, dayStart, nextDayStart],
    enabled,
    queryFn: async () => {
      const result = await getUserLogs({
        type: LOG_TYPE_ENUM.CONSUME,
        start_timestamp: Math.floor(dayStart / 1000),
        end_timestamp: Math.floor(nextDayStart / 1000) - 1,
        p: 1,
        page_size: 1,
      })
      if (!result.success) return null

      // Cache only the total, never the returned single log. A genuine zero is
      // distinct from an absent, negative or malformed count.
      const total = result.data?.total
      return typeof total === 'number' &&
        Number.isSafeInteger(total) &&
        total >= 0
        ? total
        : null
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    retry: false,
  })

  return {
    requestCount: enabled ? (query.data ?? undefined) : undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    updatedAt: query.dataUpdatedAt,
    enabled,
  }
}
