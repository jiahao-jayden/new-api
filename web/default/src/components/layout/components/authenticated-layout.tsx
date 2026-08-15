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
import { useLocation } from '@tanstack/react-router'
import { useLayoutEffect } from 'react'

import { AnimatedOutlet } from '@/components/page-transition'
import { SkipToMain } from '@/components/skip-to-main'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'

import { resolvePageTone } from '../lib/page-tone'
import { AppSidebar } from './app-sidebar'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout(props: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const pathname = useLocation({ select: (location) => location.pathname })
  const pageTone = resolvePageTone(pathname)

  useLayoutEffect(() => {
    const previousTone = document.body.dataset.pageTone
    document.body.dataset.pageTone = pageTone

    return () => {
      if (previousTone) {
        document.body.dataset.pageTone = previousTone
      } else {
        delete document.body.dataset.pageTone
      }
    }
  }, [pageTone])

  return (
    <LayoutProvider>
      <SearchProvider>
        <SidebarProvider
          defaultOpen={defaultOpen}
          style={{ '--app-header-height': '0px' } as React.CSSProperties}
        >
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              '@container/content',
              'h-svh min-h-0 overflow-hidden pt-14 md:pt-0',
              'peer-data-[variant=inset]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            <SidebarTrigger className='bg-card absolute start-4 top-3 z-40 size-9 md:hidden' />
            {props.children ?? <AnimatedOutlet />}
          </SidebarInset>
        </SidebarProvider>
      </SearchProvider>
    </LayoutProvider>
  )
}
