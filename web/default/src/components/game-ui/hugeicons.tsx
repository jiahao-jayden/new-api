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

import { GameIcon, type GameIconProps } from './game-icon'

/** Compatibility for shared primitives; all values name original Picto assets. */
export function HugeiconsIcon(
  props: Omit<GameIconProps, 'name'> & { icon: string }
) {
  const { icon, ...svgProps } = props
  return <GameIcon {...svgProps} name={icon} />
}

export const Add01Icon = 'mark-plus'
export const Alert02Icon = 'mark-warning'
export const ArrowDown01Icon = 'arrow-bottom'
export const ArrowDownIcon = 'arrow-bottom'
export const ArrowLeft01Icon = 'arrow-prev'
export const ArrowLeftIcon = 'arrow-left'
export const ArrowRight01Icon = 'arrow-next'
export const ArrowRightIcon = 'arrow-right'
export const ArrowUp01Icon = 'arrow-top'
export const Cancel01Icon = 'mark-x'
export const CheckmarkCircle02Icon = 'symbol-check'
export const InformationCircleIcon = 'symbol-info'
export const Loading03Icon = 'refresh'
export const MinusSignIcon = 'mark-minus'
export const MoreHorizontalCircle01Icon = 'menu-2'
export const MultiplicationSignCircleIcon = 'symbol-x'
export const SearchIcon = 'search'
export const SidebarLeftIcon = 'dashboard'
export const Tick02Icon = 'mark-check'
export const UnfoldMoreIcon = 'arrow-change'
