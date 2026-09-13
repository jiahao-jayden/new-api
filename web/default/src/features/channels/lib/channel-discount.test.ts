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

import { channelSchema } from '../types'
import {
  CHANNEL_FORM_DEFAULT_VALUES,
  channelFormSchema,
  transformChannelToFormDefaults,
  transformFormDataToCreatePayload,
  transformFormDataToUpdatePayload,
} from './channel-form'

const channel = channelSchema.parse({
  id: 17,
  name: 'channel-billing-test',
  type: 1,
  key: '',
  status: 1,
  created_time: 0,
  test_time: 0,
  response_time: 0,
  balance_updated_time: 0,
  models: 'test-model',
})

describe('channel discount settings', () => {
  test('existing and newly created channels default to original pricing', () => {
    assert.equal(CHANNEL_FORM_DEFAULT_VALUES.billing_discount, 1)
    assert.equal(transformChannelToFormDefaults(channel).billing_discount, 1)
    assert.equal(
      transformChannelToFormDefaults({
        ...channel,
        settings: '{"billing_discount":null}',
      }).billing_discount,
      1
    )
  })

  test('round trips fractional discounts in settings without modifying model or routing settings', () => {
    const saved = {
      ...channel,
      group: 'routing-a,routing-b',
      model_mapping: '{"test-model":"upstream-model"}',
      settings: JSON.stringify({
        billing_discount: 0.03,
        custom_setting: 'keep',
      }),
    }
    const form = transformChannelToFormDefaults(saved)
    assert.equal(form.billing_discount, 0.03)
    form.billing_discount = 0.5
    const update = transformFormDataToUpdatePayload(form, channel.id)
    const create = transformFormDataToCreatePayload(form).channel
    for (const payload of [update, create]) {
      const settings = JSON.parse(payload.settings || '{}')
      assert.equal(settings.billing_discount, 0.5)
      assert.equal(settings.custom_setting, 'keep')
      assert.equal(payload.models, saved.models)
      assert.equal(payload.group, saved.group)
      assert.equal(payload.model_mapping, saved.model_mapping)
    }
  })

  test('validates numeric factors before creating or updating channels', () => {
    const form = transformChannelToFormDefaults(channel)
    for (const value of [0.0001, 0.03, 0.3, 0.5, 1]) {
      assert.equal(
        channelFormSchema.safeParse({ ...form, billing_discount: value })
          .success,
        true
      )
    }
    for (const value of [0, -0.3, 1.01, Infinity, Number.NaN, undefined]) {
      const parsed = channelFormSchema.safeParse({
        ...form,
        billing_discount: value,
      })
      assert.equal(parsed.success, false)
      if (!parsed.success) {
        assert.ok(
          parsed.error.issues.some(
            (issue) => issue.path[0] === 'billing_discount'
          )
        )
      }
    }
  })
})
