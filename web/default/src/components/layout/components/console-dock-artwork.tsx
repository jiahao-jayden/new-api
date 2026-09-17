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
import { useId } from 'react'

/** The user explicitly chose scalable drawn chrome over a raster Dock.
 * Rectangles use the live SVG viewport so adding destinations never stretches
 * the endcaps; icons remain the original, independently rendered Unity art. */
export function ConsoleDockFrame(props: { glass?: boolean }) {
  const id = useId()
  if (props.glass) {
    return (
      <svg
        className='console-dock-frame glass-dock-frame'
        viewBox='0 0 1000 120'
        preserveAspectRatio='none'
        aria-hidden='true'
        focusable='false'
      >
        <path
          d='M0 120 C70 120 82 0 140 0 H860 C918 0 930 120 1000 120 Z'
          fill='#050607'
        />
      </svg>
    )
  }
  return (
    <svg className='console-dock-frame' aria-hidden='true' focusable='false'>
      <defs>
        <linearGradient id={`${id}-depth`} x2='0' y2='1'>
          <stop stopColor='#263f63' />
          <stop offset='1' stopColor='#12223d' />
        </linearGradient>
        <linearGradient id={`${id}-face`} x2='0' y2='1'>
          <stop stopColor='#23344f' />
          <stop offset='0.38' stopColor='#1e2d45' />
          <stop offset='0.8' stopColor='#1b2b43' />
          <stop offset='1' stopColor='#203450' />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x2='0' y2='1'>
          <stop stopColor='#46638c' />
          <stop offset='0.38' stopColor='#314e77' />
          <stop offset='0.8' stopColor='#294771' />
          <stop offset='1' stopColor='#2c4974' />
        </linearGradient>
        <linearGradient id={`${id}-light`} x2='0' y2='1'>
          <stop stopColor='#91b6ed' stopOpacity='0.08' />
          <stop offset='0.24' stopColor='#91b6ed' stopOpacity='0' />
          <stop offset='0.8' stopColor='#91b6ed' stopOpacity='0' />
          <stop offset='1' stopColor='#91b6ed' stopOpacity='0.04' />
        </linearGradient>
      </defs>
      <rect
        className='console-dock-frame-depth'
        x='0'
        y='5'
        rx='46'
        fill={`url(#${id}-depth)`}
      />
      <rect
        className='console-dock-frame-face'
        x='2'
        y='2'
        rx='44'
        fill={`url(#${id}-face)`}
        stroke={`url(#${id}-rim)`}
        strokeWidth='2.5'
      />
      <rect
        className='console-dock-frame-light'
        x='4'
        y='4'
        rx='42'
        fill='none'
        stroke={`url(#${id}-light)`}
        strokeWidth='1.2'
      />
    </svg>
  )
}

export function ConsoleDockSeat() {
  const id = useId()
  return (
    <svg
      className='console-dock-seat'
      viewBox='0 0 120 110'
      preserveAspectRatio='none'
      aria-hidden='true'
      focusable='false'
    >
      <defs>
        <linearGradient id={`${id}-rim`} x2='0' y2='1'>
          <stop stopColor='#486f96' />
          <stop offset='0.55' stopColor='#2c6494' />
          <stop offset='1' stopColor='#264d78' />
        </linearGradient>
        <linearGradient id={`${id}-face`} x2='0' y2='1'>
          <stop stopColor='#2ac8f0' />
          <stop offset='0.38' stopColor='#2bc6f1' />
          <stop offset='0.7' stopColor='#24baf3' />
          <stop offset='0.93' stopColor='#199feb' />
          <stop offset='1' stopColor='#2180b6' />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx='0.38' cy='0.16' r='0.82'>
          <stop stopColor='#bdffff' stopOpacity='0.1' />
          <stop offset='1' stopColor='#bdffff' stopOpacity='0' />
        </radialGradient>
        <linearGradient id={`${id}-edge`} x2='0' y2='1'>
          <stop stopColor='#96ecff' stopOpacity='0.75' />
          <stop offset='0.58' stopColor='#60d8ff' stopOpacity='0.2' />
          <stop offset='1' stopColor='#1d5e94' stopOpacity='0.5' />
        </linearGradient>
        <path
          id={`${id}-surface`}
          d='M5 106 C16 106 16 95 16 83 V33 C16 15 29 5 46 5 H74 C91 5 104 15 104 33 V83 C104 95 104 106 115 106 Z'
        />
      </defs>
      <path
        d='M1 109 C12 108 12 96 12 83 V33 C12 12 25 1 46 1 H74 C95 1 108 12 108 33 V83 C108 96 108 108 119 109 Z'
        fill={`url(#${id}-rim)`}
      />
      <use href={`#${id}-surface`} fill={`url(#${id}-face)`} />
      <use href={`#${id}-surface`} fill={`url(#${id}-light)`} />
      <path
        d='M16.5 80 V33 C16.5 15 29 5.5 46 5.5 H74 C91 5.5 103.5 15 103.5 33 V80'
        fill='none'
        stroke={`url(#${id}-edge)`}
        strokeWidth='1.4'
      />
    </svg>
  )
}
