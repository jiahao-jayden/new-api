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

import { getGatewayFeatures } from '../constants'

interface GatewayCardProps {
  logo: string
  systemName: string
}

/**
 * Central gateway card with features grid
 */
export function GatewayCard({ logo, systemName }: GatewayCardProps) {
  const { t } = useTranslation()
  const features = getGatewayFeatures(t)

  return (
    <div className='bg-surface-container-low rounded-3xl p-10 sm:p-12'>
      <div>
        {/* Gateway Header */}
        <div className='mb-8 flex items-center justify-center gap-3'>
          <img
            src={logo}
            alt={systemName}
            className='h-12 w-12 rounded-lg object-cover'
          />
          <h3 className='text-foreground text-2xl font-bold'>{systemName}</h3>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-2 gap-3'>
          {features.map((feature) => (
            <div
              key={feature}
              className='bg-surface-container hover:bg-surface-container-high rounded-xl px-4 py-3.5 text-center transition-colors duration-200'
            >
              <span className='text-foreground text-sm font-medium'>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
