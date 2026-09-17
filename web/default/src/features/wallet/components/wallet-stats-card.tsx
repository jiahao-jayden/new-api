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
import { useTranslation } from 'react-i18next'

import { Activity, BarChart3, WalletCards } from '@/components/game-ui/icons'
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
      <div className='pencil-wallet-stats'>
        <div className='pencil-wallet-stat-grid'>
          {['balance', 'usage', 'requests'].map((key) => (
            <div key={key} className='pencil-wallet-stat'>
              <Skeleton className='h-3.5 w-20' />
              <Skeleton className='mt-2 h-7 w-28' />
              <Skeleton className='mt-1.5 h-3.5 w-24' />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    {
      kind: 'balance',
      label: t('Current Balance'),
      value: formatQuota(props.user?.quota ?? 0),
      description: t('Remaining quota'),
      icon: WalletCards,
    },
    {
      kind: 'usage',
      label: t('Total Usage'),
      value: formatQuota(props.user?.used_quota ?? 0),
      description: t('Total consumed quota'),
      icon: BarChart3,
    },
    {
      kind: 'requests',
      label: t('API Requests'),
      value: (props.user?.request_count ?? 0).toLocaleString(),
      description: t('Total requests made'),
      icon: Activity,
    },
  ]

  return (
    <div className='pencil-wallet-stats'>
      <div className='pencil-wallet-stat-grid'>
        {stats.map((item) => (
          <div
            key={item.label}
            className='pencil-wallet-stat'
            data-wallet-stat={item.kind}
          >
            <div className='flex items-center gap-2'>
              <item.icon className='pencil-wallet-stat-icon size-4 shrink-0' />
              <div className='pencil-wallet-stat-label min-w-0'>
                {item.label}
              </div>
            </div>

            <div className='pencil-wallet-stat-value tabular-nums'>
              <span className='min-w-0 break-words'>{item.value}</span>
            </div>
            <div className='pencil-wallet-stat-description hidden md:block'>
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
