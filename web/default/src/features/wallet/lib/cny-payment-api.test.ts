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

import { api } from '@/lib/api'

import {
  calculateCnyAmount,
  calculateStripeAmount,
  requestPayment,
  requestStripePayment,
} from '../api'
import { getPaymentAmountRequest } from './payment-amount'

test('Stripe and Epay quote and pay with the same exact CNY amount, never legacy USD quantity', async () => {
  const originalAdapter = api.defaults.adapter
  const requests: { url: string | undefined; data: unknown }[] = []
  api.defaults.adapter = async (config) => {
    const data = JSON.parse(config.data as string) as {
      payment_amount_cny: number
    }
    requests.push({ url: config.url, data })
    return {
      config,
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {
        message: 'success',
        data: {
          payment_amount_cny: data.payment_amount_cny,
          credited_quota: 500000,
          credited_amount_usd: 1,
          currency: 'CNY',
          pay_link: 'https://payments.test/checkout',
        },
      },
    }
  }
  try {
    for (const method of ['stripe', 'alipay']) {
      for (const [currency, amount] of [
        ['CNY', 1500],
        ['USD', 100],
      ] as const) {
        const request = getPaymentAmountRequest(amount, method, currency, 7.3)
        assert.ok(request && 'payment_amount_cny' in request)
        const expectedAmount = currency === 'CNY' ? 1500 : 730
        assert.equal(request.payment_amount_cny, expectedAmount)
        const quote =
          method === 'stripe'
            ? await calculateStripeAmount(request)
            : await calculateCnyAmount(request)
        assert.equal(quote.data?.payment_amount_cny, expectedAmount)
        const payment = { ...request, payment_method: method }
        if (method === 'stripe') await requestStripePayment(payment)
        else await requestPayment(payment)
        const prefix = method === 'stripe' ? '/api/user/stripe' : '/api/user'
        assert.deepEqual(requests.slice(-2), [
          {
            url: `${prefix}/amount`,
            data: { payment_amount_cny: expectedAmount },
          },
          {
            url: `${prefix}/pay`,
            data: {
              payment_amount_cny: expectedAmount,
              payment_method: method,
            },
          },
        ])
      }
    }
  } finally {
    api.defaults.adapter = originalAdapter
  }
})
