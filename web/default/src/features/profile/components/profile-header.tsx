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

import { LogOut } from '@/components/game-ui/icons'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { StatusBadge } from '@/components/status-badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserAvatarFallback } from '@/lib/avatar'
import { formatCompactNumber, formatQuota } from '@/lib/format'
import { getRoleLabel, ROLE } from '@/lib/roles'

import { getDisplayName } from '../lib'
import type { UserProfile } from '../types'

// ============================================================================
// Profile Header Component
// ============================================================================

interface ProfileHeaderProps {
  profile: UserProfile | null
  loading: boolean
}

export function ProfileHeader({ profile, loading }: ProfileHeaderProps) {
  const { t } = useTranslation()
  const [signOutOpen, setSignOutOpen] = useState(false)

  if (loading) {
    return (
      <Card
        data-card-hover='false'
        className='pencil-profile-header gap-0 overflow-hidden py-0'
      >
        <CardContent className='pencil-profile-header-content'>
          <div className='pencil-profile-person'>
            <Skeleton className='size-14 shrink-0 rounded-full' />
            <div className='flex min-w-0 flex-col gap-2'>
              <Skeleton className='h-6 w-40 max-w-full' />
              <Skeleton className='h-4 w-48 max-w-full' />
              <Skeleton className='h-4 w-32 max-w-full' />
            </div>
          </div>
          <div className='pencil-profile-stats'>
            {['balance', 'usage', 'requests'].map((key) => (
              <div key={key} className='pencil-profile-stat'>
                <Skeleton className='h-3.5 w-20 max-w-full' />
                <Skeleton className='mt-2 h-6 w-24 max-w-full' />
              </div>
            ))}
          </div>
          <Skeleton className='pencil-profile-signout size-9' />
        </CardContent>
      </Card>
    )
  }

  if (!profile) return null

  const displayName = getDisplayName(profile)
  const avatarName = profile.username || displayName
  const avatarFallback = getUserAvatarFallback(avatarName)
  const roleLabel = getRoleLabel(profile.role)
  const stats = [
    {
      kind: 'balance',
      label: t('Current Balance'),
      value: formatQuota(profile.quota),
    },
    {
      kind: 'spend',
      label: t('Total Usage'),
      value: formatQuota(profile.used_quota),
    },
    {
      kind: 'requests',
      label: t('API Requests'),
      value: formatCompactNumber(profile.request_count),
    },
  ]

  return (
    <Card
      data-card-hover='false'
      className='pencil-profile-header gap-0 overflow-hidden py-0'
    >
      <CardContent className='pencil-profile-header-content'>
        <div className='pencil-profile-person'>
          <Avatar className='pencil-profile-avatar size-14 shrink-0 rounded-full text-lg'>
            <AvatarFallback className='rounded-full bg-transparent font-semibold'>
              {avatarFallback}
            </AvatarFallback>
          </Avatar>

          <div className='flex min-w-0 flex-col gap-2'>
            <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5'>
              <h1 className='max-w-full truncate text-xl font-semibold'>
                {displayName}
              </h1>
              <div className='flex flex-wrap gap-2'>
                <StatusBadge
                  label={roleLabel}
                  variant='neutral'
                  copyable={false}
                />
                <StatusBadge
                  label={`${t('User ID')} ${profile.id}`}
                  variant='neutral'
                  copyText={String(profile.id)}
                />
              </div>
            </div>

            <div className='text-muted-foreground flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs'>
              <span className='max-w-full truncate'>@{profile.username}</span>
              {profile.email && (
                <span className='max-w-full break-all'>{profile.email}</span>
              )}
              {profile.role >= ROLE.ADMIN && profile.group && (
                <span className='max-w-full truncate'>{profile.group}</span>
              )}
            </div>
          </div>
        </div>
        <dl className='pencil-profile-stats'>
          {stats.map((item) => (
            <div
              key={item.label}
              className='pencil-profile-stat'
              data-metric={item.kind}
            >
              <dt className='pencil-profile-stat-label'>{item.label}</dt>
              <dd className='pencil-profile-stat-value' title={item.value}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        <Button
          className='pencil-profile-signout'
          variant='outline'
          onClick={() => setSignOutOpen(true)}
        >
          <LogOut className='size-3.5' />
          {t('Sign out')}
        </Button>
      </CardContent>
      <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
    </Card>
  )
}
