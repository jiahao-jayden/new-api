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

const MATERIAL_CHART_FALLBACK = [
  '#495d92',
  '#735471',
  '#226a4c',
  '#87521a',
  '#ba1a1a',
  '#5b5891',
  '#585e71',
  '#735471',
  '#3d6473',
  '#596239',
  '#7a5367',
  '#6276ac',
] as const

export function getMaterialColor(variable: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.body)
    .getPropertyValue(variable)
    .trim()
  return value || fallback
}

export function getMaterialChartColors(domainLength: number): string[] {
  const palette = MATERIAL_CHART_FALLBACK.map((fallback, index) =>
    getMaterialColor(`--chart-${index + 1}`, fallback)
  )
  const colorCount = Math.max(1, domainLength)
  return Array.from(
    { length: colorCount },
    (_, index) => palette[index % palette.length]
  )
}

export function getMaterialChartTokens() {
  return {
    grid: getMaterialColor('--outline-variant', '#c5c6d0'),
    label: getMaterialColor('--on-surface-variant', '#45464f'),
    outline: getMaterialColor('--outline', '#757780'),
    point: getMaterialColor('--surface-container-lowest', '#ffffff'),
    primary: getMaterialColor('--primary', '#495d92'),
    success: getMaterialColor('--success', '#226a4c'),
  }
}
