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
import type { LogOtherData } from '../types'

/** Historical group-priced logs must not be reinterpreted as channel pricing. */
export function getLogChannelDiscount(
  other: LogOtherData | null
): number | null {
  const factor = other?.channel_discount
  if (
    other?.pricing_source !== 'channel' ||
    typeof factor !== 'number' ||
    !Number.isFinite(factor) ||
    factor <= 0 ||
    factor > 1
  ) {
    return null
  }
  return factor
}

/** Log unit-price fields and expression coefficients are original USD prices. */
export function getLogDisplayUnitPrice(
  other: LogOtherData | null,
  originalUSD: number
): number {
  return originalUSD * (getLogChannelDiscount(other) ?? 1)
}
