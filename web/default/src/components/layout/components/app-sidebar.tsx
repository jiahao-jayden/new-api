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
import {
  BookOpen,
  ExternalLink,
  Home,
  Info,
  LayoutDashboard,
  Search as SearchIcon,
  Store,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationPopover } from '@/components/notification-popover'
import { ProfileDropdown } from '@/components/profile-dropdown'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { useLayout } from '@/context/layout-provider'
import { useSearch } from '@/context/search-provider'
import { useNotifications } from '@/hooks/use-notifications'
import { useSidebarView } from '@/hooks/use-sidebar-view'
import { useTopNavLinks } from '@/hooks/use-top-nav-links'
import { MOTION_TRANSITION, MOTION_VARIANTS } from '@/lib/motion'
import { cn } from '@/lib/utils'

import { NavGroup } from './nav-group'
import { SidebarViewHeader } from './sidebar-view-header'
import { SystemBrand } from './system-brand'

const TOP_NAV_ICON_BY_PATH: Record<string, LucideIcon> = {
  '/': Home,
  '/about': Info,
  '/dashboard': LayoutDashboard,
  '/docs': BookOpen,
  '/pricing': Store,
  '/rankings': Trophy,
}

function getTopNavIcon(href: string, external?: boolean): LucideIcon {
  if (external) return ExternalLink
  const pathname = href.split(/[?#]/, 1)[0]
  return TOP_NAV_ICON_BY_PATH[pathname] ?? ExternalLink
}

function isTopNavLinkActive(
  pathname: string,
  href: string,
  external?: boolean
): boolean {
  if (external) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarSearch() {
  const { t } = useTranslation()
  const { setOpen } = useSearch()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={t('Search')} onClick={() => setOpen(true)}>
          <SearchIcon aria-hidden='true' />
          <span className='group-data-[collapsible=icon]:hidden'>
            {t('Search')}
          </span>
          <kbd className='border-sidebar-border bg-sidebar-accent ms-auto rounded border px-1.5 py-0.5 font-mono text-[10px] group-data-[collapsible=icon]:hidden'>
            ⌘K
          </kbd>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function SidebarTopNavigation() {
  const { t } = useTranslation()
  const pathname = useLocation({ select: (location) => location.pathname })
  const links = useTopNavLinks().filter(
    (link) => link.href.split(/[?#]/, 1)[0] !== '/dashboard'
  )
  const { setOpenMobile } = useSidebar()

  if (links.length === 0) return null

  return (
    <SidebarGroup className='px-2 py-1'>
      <SidebarGroupLabel className='text-muted-foreground/70 px-2 text-[11px] font-medium tracking-wider uppercase'>
        {t('Platform')}
      </SidebarGroupLabel>
      <SidebarMenu>
        {links.map((link) => {
          const Icon = getTopNavIcon(link.href, link.external)
          const active = isTopNavLinkActive(pathname, link.href, link.external)
          const className = cn(
            link.disabled && 'pointer-events-none opacity-50'
          )

          return (
            <SidebarMenuItem key={`${link.title}-${link.href}`}>
              <SidebarMenuButton
                isActive={active}
                tooltip={link.title}
                className={className}
                render={
                  link.external ? (
                    <a
                      href={link.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-disabled={link.disabled}
                      onClick={() => setOpenMobile(false)}
                    />
                  ) : (
                    <Link
                      to={link.href}
                      disabled={link.disabled}
                      onClick={() => setOpenMobile(false)}
                    />
                  )
                }
              >
                <Icon aria-hidden='true' className='shrink-0' />
                <span className='min-w-0 flex-1 truncate'>{link.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function SidebarUtilities() {
  const notifications = useNotifications()

  return (
    <SidebarFooter className='border-sidebar-border border-t group-data-[collapsible=icon]:p-1'>
      <div className='flex items-center justify-between gap-1 group-data-[collapsible=icon]:flex-col'>
        <NotificationPopover
          open={notifications.popoverOpen}
          onOpenChange={notifications.setPopoverOpen}
          unreadCount={notifications.unreadCount}
          activeTab={notifications.activeTab}
          onTabChange={notifications.setActiveTab}
          notice={notifications.notice}
          announcements={notifications.announcements}
          loading={notifications.loading}
          className='size-8'
        />
        <LanguageSwitcher />
        <ConfigDrawer />
        <ProfileDropdown />
      </div>
    </SidebarFooter>
  )
}

/**
 * Application sidebar.
 *
 * Adopts the Vercel / Cloudflare "drill-in" pattern: the URL drives
 * which sidebar *view* is rendered. Clicking a top-level entry like
 * `System Settings` swaps the sidebar to a contextual workspace —
 * with a `← Back to Dashboard` affordance — instead of stacking the
 * sub-navigation inside the root tree.
 *
 * Architecture:
 *   - View resolution + filtering: {@link useSidebarView}
 *   - View registry: `layout/lib/sidebar-view-registry.ts`
 *   - Per-view header: {@link SidebarViewHeader}
 *
 * Adding a new nested view only requires registering a {@link SidebarView}
 * in the registry; this component requires no changes.
 */
export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { key, view, navGroups } = useSidebarView()
  const shouldReduce = useReducedMotion()

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader className='border-sidebar-border border-b'>
        <div className='flex min-w-0 items-center gap-2'>
          <div className='min-w-0 flex-1 group-data-[collapsible=icon]:hidden'>
            <SystemBrand variant='inline' />
          </div>
          <SidebarTrigger className='size-8 shrink-0' />
        </div>
        <SidebarSearch />
      </SidebarHeader>

      {view && <SidebarViewHeader view={view} />}

      <SidebarContent className='py-2'>
        <SidebarTopNavigation />
        <AnimatePresence mode='wait' initial={false}>
          <motion.div
            key={key}
            initial={
              shouldReduce ? false : MOTION_VARIANTS.sidebarSlide.initial
            }
            animate={MOTION_VARIANTS.sidebarSlide.animate}
            exit={shouldReduce ? undefined : MOTION_VARIANTS.sidebarSlide.exit}
            transition={MOTION_TRANSITION.fast}
            className='flex flex-col'
          >
            {navGroups.map((props) => (
              <NavGroup key={props.id || props.title} {...props} />
            ))}
          </motion.div>
        </AnimatePresence>
      </SidebarContent>

      <SidebarUtilities />
      <SidebarRail />
    </Sidebar>
  )
}
