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
import { useId, type ComponentPropsWithRef } from 'react'

import { cn } from '@/lib/utils'

export type GameIconProps = ComponentPropsWithRef<'svg'> & {
  /** Original GUI Pro Simple Casual filename, without its prefix/extension. */
  name: string
  family?: 'picto' | 'items'
  size?: number | string
}

export function GameIcon(props: GameIconProps) {
  const { name, family = 'picto', size = 24, children, ...svgProps } = props
  const maskId = useId()
  const source = `/assets/unity-ui/${family}/${name}.png`
  const labelled = Boolean(
    props['aria-label'] || props['aria-labelledby'] || children
  )

  return (
    <svg
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      width={size}
      height={size}
      viewBox='0 0 64 64'
      fill='none'
      focusable='false'
      {...svgProps}
      className={cn('game-icon shrink-0', props.className)}
      data-game-icon={`${family}/${name}`}
    >
      {family === 'items' ? (
        <image href={source} width='64' height='64' />
      ) : (
        <>
          <defs>
            <mask id={maskId} x='0' y='0' width='64' height='64'>
              <image href={source} width='64' height='64' />
            </mask>
          </defs>
          <rect
            width='64'
            height='64'
            fill='currentColor'
            mask={`url(#${maskId})`}
          />
        </>
      )}
      {children}
    </svg>
  )
}
