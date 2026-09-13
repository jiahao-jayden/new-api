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
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getPaymentBrand } from './payment-brand'

test('Waffo provider method identifies its brand when the payment type is generic or missing', () => {
  assert.equal(getPaymentBrand('APM', 'ALIPAY'), 'alipay')
  assert.equal(getPaymentBrand(undefined, 'WECHAT'), 'wxpay')
  assert.equal(getPaymentBrand('stripe', 'ALIPAY'), 'alipay')
})

test('standard methods retain their brand without a provider-specific name', () => {
  assert.equal(getPaymentBrand('alipay'), 'alipay')
  assert.equal(getPaymentBrand('wxpay'), 'wxpay')
  assert.equal(getPaymentBrand(' STRIPE '), 'stripe')
  assert.equal(getPaymentBrand('wechat', ''), 'wxpay')
})

test('unknown, automatic and multi-method identifiers do not invent a payment brand', () => {
  assert.equal(getPaymentBrand('APM', 'CUSTOM'), undefined)
  assert.equal(getPaymentBrand('ALIPAY,WECHAT'), undefined)
  assert.equal(getPaymentBrand('waffo'), undefined)
  assert.equal(getPaymentBrand(), undefined)
})
