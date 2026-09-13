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
import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useIsAdmin } from '@/hooks/use-admin'
import { useUserDisplay } from '@/hooks/use-user-display'
import { getUserAvatarFallback, getUserAvatarStyle } from '@/lib/avatar'
import { useAuthStore } from '@/stores/auth-store'

const avatarFallbackClassName = 'font-semibold text-white'

export function ProfileDropdown(props: { variant?: 'avatar' | 'hud' }) {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()
  const variant = props.variant ?? 'avatar'
  const user = useAuthStore((state) => state.auth.user)
  const { displayName, roleLabel } = useUserDisplay(user)
  const avatarName = user?.username || displayName
  const avatarFallback = getUserAvatarFallback(avatarName)
  const avatarFallbackStyle = useMemo(
    () => getUserAvatarStyle(avatarName),
    [avatarName]
  )

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant='ghost'
            render={<Link to='/profile' />}
            nativeButton={false}
          />
        }
        aria-label={`${t('Profile')}: ${displayName}`}
        className={
          variant === 'hud' ? 'console-hud-profile' : 'game-profile-button'
        }
      >
        <Avatar className={variant === 'hud' ? 'console-hud-avatar' : 'size-6'}>
          <AvatarFallback
            className={`${avatarFallbackClassName} text-[11px]`}
            style={variant === 'hud' ? undefined : avatarFallbackStyle}
          >
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        {variant === 'hud' && (
          <span className='console-hud-user-copy sr-only'>
            <span>{displayName}</span>
            <small>
              {roleLabel}
              {isAdmin && user?.group ? ` · ${user.group}` : ''}
            </small>
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent>
        <span>{displayName}</span>
        <span className='text-xs'>
          {roleLabel}
          {isAdmin && user?.group ? ` · ${user.group}` : ''}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}
