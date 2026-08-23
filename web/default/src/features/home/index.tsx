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

function HomeFrame(props: { className: string }) {
  const { t } = useTranslation()

  return (
    <iframe
      src='/dotapi-landing.html'
      className={`block w-full border-0 bg-[#040405] ${props.className}`}
      title={t('Home')}
      sandbox='allow-scripts allow-top-navigation-by-user-activation'
    />
  )
}

export function Home() {
  return <HomeFrame className='h-svh' />
}

export function ConsoleHome() {
  return <HomeFrame className='h-full' />
}
