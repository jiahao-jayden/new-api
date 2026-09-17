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

/** Approved edge-attached inspector outline shared by Keys and Models. */
export function GlassInspectorFrame(props: { className?: string }) {
  const highlightId = useId()
  return (
    <svg
      className={props.className}
      viewBox='0 0 480 800'
      preserveAspectRatio='none'
      aria-hidden='true'
      focusable='false'
    >
      <defs>
        <linearGradient id={highlightId} x1='0' y1='0' x2='1' y2='1'>
          <stop stopColor='white' stopOpacity='0.12' />
          <stop offset='0.5' stopColor='white' stopOpacity='0.55' />
          <stop offset='1' stopColor='white' stopOpacity='0.12' />
        </linearGradient>
      </defs>
      <path
        d='M68 0.5 H480 V799.5 H40 Q0.5 799.5 0.5 760 V100 C0.5 62 48 64 48 20 C48 9.2 57 0.5 68 0.5 Z'
        fill='#08090b'
        stroke={`url(#${highlightId})`}
        strokeWidth='1'
        vectorEffect='non-scaling-stroke'
      />
    </svg>
  )
}
