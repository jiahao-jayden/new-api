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
import { Activity, BarChart3, WalletCards } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { formatQuota } from '@/lib/format'

import type { UserWalletData } from '../types'

interface WalletStatsCardProps {
  user: UserWalletData | null
  loading?: boolean
}

export function WalletStatsCard(props: WalletStatsCardProps) {
  const { t } = useTranslation()
  if (props.loading) {
    return (
      <div className='grid gap-3 sm:grid-cols-3'>
        {['balance', 'usage', 'requests'].map((key) => (
          <div key={key} className='bg-muted/55 rounded-2xl px-5 py-5'>
            <Skeleton className='h-3.5 w-20' />
            <Skeleton className='mt-3 h-7 w-28' />
            <Skeleton className='mt-1.5 h-3.5 w-24' />
          </div>
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: t('Current Balance'),
      value: formatQuota(props.user?.quota ?? 0),
      description: t('Remaining quota'),
      icon: WalletCards,
      className: 'bg-info-container text-info-container-foreground',
      iconClassName: 'text-info',
    },
    {
      label: t('Total Usage'),
      value: formatQuota(props.user?.used_quota ?? 0),
      description: t('Total consumed quota'),
      icon: BarChart3,
      className: 'bg-success-container text-success-container-foreground',
      iconClassName: 'text-success',
    },
    {
      label: t('API Requests'),
      value: (props.user?.request_count ?? 0).toLocaleString(),
      description: t('Total requests made'),
      icon: Activity,
      className: 'bg-warning-container text-warning-container-foreground',
      iconClassName: 'text-warning',
    },
  ]

  return (
    <div className='grid gap-3 sm:grid-cols-3'>
      {stats.map((item) => (
        <div
          key={item.label}
          className={`min-w-0 rounded-2xl px-5 py-5 ${item.className}`}
        >
          <div className='flex items-center gap-2.5'>
            <item.icon
              className={`size-4 shrink-0 ${item.iconClassName}`}
              aria-hidden='true'
            />
            <div className='truncate text-sm font-semibold'>{item.label}</div>
          </div>

          <div className='mt-4 text-2xl font-bold break-all tabular-nums'>
            {item.value}
          </div>
          <div className='mt-1 text-xs opacity-75'>{item.description}</div>
        </div>
      ))}
    </div>
  )
}
