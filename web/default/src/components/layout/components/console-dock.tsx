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
import { Link, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { GameIcon } from '@/components/game-ui/game-icon'
import { Boxes } from '@/components/game-ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSidebarConfig } from '@/hooks/use-sidebar-config'
import { useSidebarData } from '@/hooks/use-sidebar-data'
import { useTopNavLinks } from '@/hooks/use-top-nav-links'
import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

import { resolveSidebarView } from '../lib/sidebar-view-registry'
import type { NavLink } from '../types'
import { ConsoleDockFrame, ConsoleDockSeat } from './console-dock-artwork'
import { ConsoleNavigationMenu } from './console-navigation-menu'
import { SystemSettingsDock } from './system-settings-dock'

const DOCK_ROUTES = [
  { url: '/dashboard/overview', label: 'Home', icon: 'home', family: 'items' },
  { url: '/keys', label: 'Keys', icon: 'key-gold', family: 'items' },
  {
    url: '/pricing',
    label: 'Models',
    view: 'card',
    icon: 'brain',
    family: 'picto',
  },
  {
    url: '/dashboard/models',
    label: 'Usage',
    icon: 'scroll-1-stats',
    family: 'items',
  },
  {
    url: '/wallet',
    label: 'Ledger',
    icon: 'coin-gold-dollar',
    family: 'items',
  },
  {
    url: '/usage-logs/common',
    label: 'Logs',
    icon: 'document',
    family: 'items',
  },
  { url: '/profile', label: 'System', icon: 'gear', family: 'items' },
] as const

export function ConsoleDock() {
  const { t } = useTranslation()
  const pathname = useLocation({ select: (location) => location.pathname })
  const role = useAuthStore((state) => state.auth.user?.role ?? ROLE.GUEST)
  const { navGroups } = useSidebarData()
  const configGroups = useSidebarConfig(navGroups)
  const groups = configGroups
    .filter((group) => group.id !== 'admin' || role >= ROLE.ADMIN)
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.requiredRole || role >= item.requiredRole
      ),
    }))
  const publicLinks = useTopNavLinks()
  const items = groups
    .flatMap((group) => group.items)
    .filter((item): item is NavLink => Boolean(item.url))
  if (publicLinks.some((link) => link.href === '/pricing' && !link.disabled)) {
    items.push({ title: t('Models'), url: '/pricing', icon: Boxes })
  }

  const settingsView = resolveSidebarView(pathname)
  if (settingsView?.id === 'system-settings' && role === ROLE.SUPER_ADMIN) {
    return <SystemSettingsDock view={settingsView} pathname={pathname} />
  }

  return (
    <nav className='console-dock' aria-label={t('Console')}>
      <div className='console-dock-viewport'>
        <div className='console-dock-items'>
          <ConsoleDockFrame />
          {DOCK_ROUTES.flatMap((route) => {
            const item = items.find((entry) => entry.url === route.url)
            if (!item) return []
            const routeView = 'view' in route ? route.view : undefined
            const active = routeView
              ? pathname.startsWith('/pricing')
              : pathname === item.url ||
                item.activeUrls?.some((url) => url && pathname.startsWith(url))
            const content = (
              <>
                <ConsoleDockSeat />
                <GameIcon name={route.icon} family={route.family} />
                <span className='console-dock-label' aria-hidden='true'>
                  {t(route.label)}
                </span>
              </>
            )
            return [
              <Tooltip key={route.label}>
                <TooltipTrigger
                  render={
                    routeView ? (
                      <Link
                        to='/pricing'
                        search={(previous) => ({
                          ...previous,
                          view: routeView,
                        })}
                      />
                    ) : (
                      <Link to={item.url} />
                    )
                  }
                  className='console-dock-link'
                  data-destination={route.label.toLowerCase()}
                  data-active={active || undefined}
                  aria-current={active ? 'page' : undefined}
                  aria-label={t(route.label)}
                >
                  {content}
                </TooltipTrigger>
                <TooltipContent side='top'>{t(route.label)}</TooltipContent>
              </Tooltip>,
            ]
          })}
          <ConsoleNavigationMenu groups={groups} publicLinks={publicLinks} />
        </div>
      </div>
    </nav>
  )
}
