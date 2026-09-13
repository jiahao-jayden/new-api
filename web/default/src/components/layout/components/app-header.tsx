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
import { ProfileDropdown } from '@/components/profile-dropdown'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useConsoleDailyUsage } from '@/hooks/use-console-daily-usage'
import { useSidebarView } from '@/hooks/use-sidebar-view'
import { useTopNavLinks } from '@/hooks/use-top-nav-links'
import { formatQuota } from '@/lib/format'
import { useAuthStore } from '@/stores/auth-store'
import { useCurrencyPreference } from '@/stores/currency-preference-store'

import { Header } from './header'
import { SystemBrand } from './system-brand'

const WORKSPACE_TITLES: Record<string, string> = {
  '/dashboard/overview': 'Home',
  '/dashboard/models': 'Usage Monitor',
  '/keys': 'Key Vault',
  '/pricing': 'Model Rack',
  '/wallet': 'Billing Center',
  '/usage-logs/common': 'Request Logs',
  '/profile': 'Account and System',
}

export function AppHeader() {
  const { t } = useTranslation()
  const pathname = useLocation({ select: (location) => location.pathname })
  const searchString = useLocation({ select: (location) => location.searchStr })
  const search = new URLSearchParams(searchString)
  const links = useTopNavLinks()
  const { navGroups } = useSidebarView()
  const user = useAuthStore((state) => state.auth.user)
  const preferredCurrency = useCurrencyPreference()
  const { requestCount } = useConsoleDailyUsage()
  const docs = links.find((link) => link.external || link.href === '/docs')
  const existingTitle =
    navGroups
      .flatMap((group) => group.items)
      .find(
        (item) =>
          item.url === pathname ||
          item.items?.some((entry) => entry.url === pathname)
      )?.title ?? links.find((link) => link.href === pathname)?.title
  let pageTitle = WORKSPACE_TITLES[pathname]
    ? t(WORKSPACE_TITLES[pathname])
    : existingTitle
  if (pathname.startsWith('/pricing/')) {
    pageTitle =
      search.get('detailTab') === 'api'
        ? t('API reference')
        : t('Model details')
  }

  return (
    <Header className='console-hud'>
      <div className='console-hud-identity'>
        <SystemBrand variant='hud' />
        {pageTitle && <span className='console-hud-title'>{pageTitle}</span>}
      </div>
      {user && (
        <div className='console-hud-metrics' data-currency={preferredCurrency}>
          <div className='console-hud-metric' data-metric='balance'>
            <GameIcon family='items' name='coin-gold-dollar' />
            <div title={t('Balance')}>
              <span className='sr-only'>{t('Balance')}</span>
              <strong>
                {user.quota == null ? '—' : formatQuota(user.quota)}
              </strong>
            </div>
          </div>
          <div className='console-hud-metric' data-metric='requests'>
            <GameIcon name='chart' />
            <div title={t("Today's Requests")}>
              <span className='sr-only'>{t("Today's Requests")}</span>
              <strong>
                {requestCount == null ? '—' : requestCount.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      )}
      <div className='console-hud-actions'>
        {docs && (
          <Tooltip>
            <TooltipTrigger
              render={
                docs.external ? (
                  <a
                    href={docs.href}
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                ) : (
                  <Link to={docs.href} />
                )
              }
              className='console-hud-manual'
              aria-label={t('Manual')}
            >
              <GameIcon name='book-1' />
            </TooltipTrigger>
            <TooltipContent>{t('Manual')}</TooltipContent>
          </Tooltip>
        )}
        <ProfileDropdown variant='hud' />
      </div>
    </Header>
  )
}
