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
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { GameIcon } from '@/components/game-ui/game-icon'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import type { NavCollapsible, SidebarView } from '../types'

const CATEGORY_ICONS: Record<string, string> = {
  site: 'setting-1',
  auth: 'key-1',
  billing: 'money',
  models: 'brain',
  security: 'shield',
  content: 'dashboard',
  operations: 'tool-1',
}

type SystemSettingsDockProps = {
  view: SidebarView
  pathname: string
}

export function SystemSettingsDock(props: SystemSettingsDockProps) {
  const { t } = useTranslation()
  const dockRef = useRef<HTMLDivElement>(null)
  const categories = props.view
    .getNavGroups(t)
    .flatMap((group) => group.items)
    .filter((item): item is NavCollapsible => Boolean(item.items?.length))
  const activeCategory =
    categories.find((category) =>
      category.items.some((item) => item.url === props.pathname)
    ) ?? categories[0]

  useEffect(() => {
    const dock = dockRef.current
    if (!dock) return

    // Keep both levels discoverable on narrow screens and direct deep links.
    const revealActiveLinks = () => {
      dock.querySelectorAll('[aria-current]').forEach((link) => {
        link.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
          behavior: 'instant',
        })
      })
    }
    revealActiveLinks()
    const observer = new ResizeObserver(revealActiveLinks)
    observer.observe(dock)
    return () => observer.disconnect()
  }, [props.pathname, t])

  if (!activeCategory) return null

  return (
    <div ref={dockRef} className='console-settings-dock'>
      <nav
        className='console-settings-sections'
        aria-label={activeCategory.title}
      >
        <div className='console-settings-section-links'>
          {activeCategory.items.map((item) => {
            const active = item.url === props.pathname
            return (
              <Link
                key={item.url}
                to={item.url}
                className='console-settings-section-link'
                data-category={item.url?.split('/')[2]}
                aria-current={active ? 'page' : undefined}
              >
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>
      <div className='console-settings-dock-bottom'>
        <Link
          to={props.view.parent.to}
          className='console-dock-link console-settings-back'
          aria-label={t('Back to Dashboard')}
          title={t('Back to Dashboard')}
        >
          <GameIcon name='arrow-left' />
          <span className='sr-only'>{t('Console')}</span>
        </Link>
        <nav
          className='console-settings-categories'
          aria-label={t('System Settings')}
        >
          <div className='console-settings-category-links'>
            {categories.map((category) => {
              const active = category === activeCategory
              const categoryPath = category.items[0].url?.split('/')[2] ?? ''
              return (
                <Tooltip key={category.items[0].url}>
                  <TooltipTrigger
                    render={
                      <Link
                        to={active ? props.pathname : category.items[0].url}
                      />
                    }
                    className='console-dock-link'
                    data-category={categoryPath}
                    data-active={active || undefined}
                    aria-current={active ? 'true' : undefined}
                    aria-label={category.title}
                  >
                    <GameIcon
                      name={CATEGORY_ICONS[categoryPath] ?? 'setting-1'}
                    />
                    <span className='sr-only'>{category.title}</span>
                  </TooltipTrigger>
                  <TooltipContent side='top'>{category.title}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
