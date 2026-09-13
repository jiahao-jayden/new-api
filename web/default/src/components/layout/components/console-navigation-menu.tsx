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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GameIcon } from '@/components/game-ui/game-icon'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationPopover } from '@/components/notification-popover'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
} from '@/components/ui/popover'
import { useNotifications } from '@/hooks/use-notifications'

import type { NavGroup as NavGroupType, TopNavLink } from '../types'
import { NavGroup } from './nav-group'

export function ConsoleNavigationMenu({
  groups,
  publicLinks,
}: {
  groups: NavGroupType[]
  publicLinks: TopNavLink[]
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const notifications = useNotifications()
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant='ghost'
            className='console-dock-more'
            aria-label={t('More')}
            title={t('More')}
          />
        }
      >
        <GameIcon name='menu-2' />
      </PopoverTrigger>
      <PopoverContent
        side='top'
        align='end'
        sideOffset={10}
        className='console-navigation-menu'
      >
        <PopoverTitle className='sr-only'>{t('More')}</PopoverTitle>
        <div className='console-navigation-tools'>
          <LanguageSwitcher />
          <NotificationPopover
            open={notifications.popoverOpen}
            onOpenChange={notifications.setPopoverOpen}
            unreadCount={notifications.unreadCount}
            activeTab={notifications.activeTab}
            onTabChange={notifications.setActiveTab}
            notice={notifications.notice}
            announcements={notifications.announcements}
            loading={notifications.loading}
          />
        </div>
        <div
          className='console-navigation-groups'
          onClickCapture={(event) => {
            if ((event.target as HTMLElement).closest('a')) setOpen(false)
          }}
        >
          {groups.map((group) => (
            <NavGroup key={group.id || group.title} {...group} />
          ))}
          <div className='console-navigation-public'>
            {publicLinks
              .filter((link) => !link.disabled)
              .map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {link.title}
                  </a>
                ) : (
                  <Link key={link.href} to={link.href}>
                    {link.title}
                  </Link>
                )
              )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
