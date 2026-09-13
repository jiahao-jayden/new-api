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
import { describe, test } from 'node:test'

import { getLogChannelDiscount, getLogDisplayUnitPrice } from './billing-price'

describe('logged channel prices', () => {
  test('uses the recorded channel factor exactly once even with compatibility group fields', () => {
    const other = {
      pricing_source: 'channel',
      channel_discount: 0.3,
      group_ratio: 0.3,
      user_group_ratio: 0.5,
    }
    assert.equal(getLogChannelDiscount(other), 0.3)
    assert.equal(getLogDisplayUnitPrice(other, 10), 3)
    assert.equal(getLogDisplayUnitPrice(other, 30), 9)
    assert.equal(getLogDisplayUnitPrice(other, 0.8), 0.24)
    assert.equal(getLogDisplayUnitPrice(other, 0), 0)
  })

  test('preserves legacy group log unit prices and never retroactively applies channel pricing', () => {
    assert.equal(
      getLogDisplayUnitPrice({ group_ratio: 0.3, user_group_ratio: 0.5 }, 10),
      10
    )
    assert.equal(getLogDisplayUnitPrice({ channel_discount: 0.3 }, 10), 10)
    assert.equal(getLogChannelDiscount({ group_ratio: 0.3 }), null)
  })

  test('rejects invalid recorded discounts rather than displaying invented or negative prices', () => {
    for (const factor of [undefined, 0, -0.1, 1.2, Number.NaN, Infinity]) {
      const other = { pricing_source: 'channel', channel_discount: factor }
      assert.equal(getLogChannelDiscount(other), null)
      assert.equal(getLogDisplayUnitPrice(other, 10), 10)
    }
  })
})
