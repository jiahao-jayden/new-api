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
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Main } from '@/components/layout'

export function ConsoleHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    function handleNavigation(event: MessageEvent<unknown>) {
      // The local HTML runs in an opaque-origin sandbox. Only this frame may
      // request the one supported console action; never accept arbitrary URLs.
      if (
        !iframeRef.current?.contentWindow ||
        event.source !== iframeRef.current.contentWindow ||
        !event.data ||
        typeof event.data !== 'object' ||
        !('type' in event.data) ||
        event.data.type !== 'dotapi:open-keys'
      ) {
        return
      }
      void navigate({ to: '/keys' })
    }

    window.addEventListener('message', handleNavigation)
    return () => window.removeEventListener('message', handleNavigation)
  }, [navigate])

  return (
    <Main id='content'>
      <iframe
        ref={iframeRef}
        src='/dotapi-landing.html?embedded=1'
        className='block min-h-0 w-full flex-1 border-0 bg-[#040405]'
        title={t('Home')}
        sandbox='allow-scripts'
      />
    </Main>
  )
}
