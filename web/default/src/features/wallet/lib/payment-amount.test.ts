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

import { getPaymentAmountRequest } from './payment-amount'

test('CNY input is actual payment money, never multiplied by the exchange rate', () => {
  assert.deepEqual(getPaymentAmountRequest(1500, 'stripe', 'CNY', 7.3), {
    payment_amount_cny: 1500,
  })
  assert.deepEqual(getPaymentAmountRequest(1500, 'alipay', 'CNY', 7.3), {
    payment_amount_cny: 1500,
  })
  assert.deepEqual(getPaymentAmountRequest(100.25, 'wxpay', 'CNY', 7.3), {
    payment_amount_cny: 100.25,
  })
})

test('USD display input converts into CNY exactly once at the payment boundary', () => {
  assert.deepEqual(getPaymentAmountRequest(100, 'stripe', 'USD', 7.3), {
    payment_amount_cny: 730,
  })
  assert.deepEqual(getPaymentAmountRequest(1.23, 'stripe', 'USD', 7.3), {
    payment_amount_cny: 8.98,
  })
  assert.deepEqual(getPaymentAmountRequest(100, 'alipay', 'USD', 7.3), {
    payment_amount_cny: 730,
  })
  assert.deepEqual(getPaymentAmountRequest(1.23, 'alipay', 'USD', 7.3), {
    payment_amount_cny: 8.98,
  })
})

test('legacy payment providers retain integer USD quantities and reject fractional quantities', () => {
  for (const provider of ['waffo', 'waffo_pancake']) {
    assert.deepEqual(getPaymentAmountRequest(145, provider, 'CNY', 7.25), {
      amount: 20,
    })
    assert.deepEqual(getPaymentAmountRequest(20, provider, 'USD', 7.25), {
      amount: 20,
    })
    assert.equal(getPaymentAmountRequest(1500, provider, 'CNY', 7.25), null)
  }
})

test('invalid payment amounts and exchange rates cannot create a request', () => {
  for (const amount of [0, -1, Number.NaN, Infinity, Number.MAX_VALUE]) {
    assert.equal(getPaymentAmountRequest(amount, 'alipay', 'CNY', 7.3), null)
  }
  for (const rate of [0, -1, Number.NaN, Infinity]) {
    assert.equal(getPaymentAmountRequest(100, 'alipay', 'USD', rate), null)
  }
})
