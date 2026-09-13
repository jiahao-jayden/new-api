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
import type { PreferredCurrency } from '@/stores/currency-preference-store'

export function isLegacyPaymentType(paymentType: string): boolean {
  return ['waffo', 'waffo_pancake'].includes(paymentType)
}

/** Translate the entered money amount at the API boundary, never by relabeling it. */
export function getPaymentAmountRequest(
  displayAmount: number,
  paymentType: string,
  displayCurrency: PreferredCurrency,
  usdExchangeRate: number
): { amount: number } | { payment_amount_cny: number } | null {
  if (!Number.isFinite(displayAmount) || displayAmount <= 0) return null
  if (!Number.isFinite(usdExchangeRate) || usdExchangeRate <= 0) return null

  if (isLegacyPaymentType(paymentType)) {
    const amountUSD =
      displayCurrency === 'USD'
        ? displayAmount
        : displayAmount / usdExchangeRate
    const quantity = Math.round(amountUSD)
    // These providers still use integer product quantities. Do not silently floor.
    if (!Number.isSafeInteger(quantity) || quantity <= 0) return null
    if (Math.abs(amountUSD - quantity) > 1e-8) return null
    return { amount: quantity }
  }

  const amountCNY =
    displayCurrency === 'CNY' ? displayAmount : displayAmount * usdExchangeRate
  const cents = Math.round(amountCNY * 100)
  if (!Number.isSafeInteger(cents) || cents <= 0) return null
  return { payment_amount_cny: cents / 100 }
}
