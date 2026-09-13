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

export type PaymentBrand = 'alipay' | 'wxpay' | 'stripe'

/** Only provider identifiers identify a brand; display names are not evidence. */
export function getPaymentBrand(
  paymentType?: string,
  providerMethodName?: string
): PaymentBrand | undefined {
  for (const identifier of [providerMethodName, paymentType]) {
    switch (identifier?.trim().toLowerCase()) {
      case 'alipay':
        return 'alipay'
      case 'wxpay':
      case 'wechat':
        return 'wxpay'
      case 'stripe':
        return 'stripe'
    }
  }
  return undefined
}
