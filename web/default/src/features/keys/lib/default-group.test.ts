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

import { createApiKey, updateApiKey } from '../api'
import type { ApiKeyFormData } from '../types'
import {
  getApiKeyFormDefaultValues,
  transformApiKeyToFormDefaults,
  transformFormDataToPayload,
} from './api-key-form'
import { getGuideModelLimits } from './api-key-guide'

test('new keys use default routing without model restrictions or cross-group retries', () => {
  const defaults = getApiKeyFormDefaultValues()
  const payload = transformFormDataToPayload({ ...defaults, name: 'New key' })
  assert.equal(payload.group, 'default')
  assert.equal(payload.cross_group_retry, false)
  assert.equal(payload.model_limits_enabled, false)
  assert.equal(payload.model_limits, '')
  assert.equal(payload.unlimited_quota, true)
})

test('editing a historical group key preserves restrictions and lifetime while normalizing routing', () => {
  const defaults = transformApiKeyToFormDefaults({
    id: 12,
    name: 'Existing key',
    key: 'masked',
    status: 1,
    remain_quota: 0,
    used_quota: 0,
    unlimited_quota: true,
    created_time: 1,
    accessed_time: 2,
    expired_time: 2000000000,
    model_limits_enabled: true,
    model_limits: 'claude-sonnet-4,gpt-5',
    allow_ips: '192.0.2.1',
    group: 'auto',
    cross_group_retry: true,
  })
  const payload = transformFormDataToPayload(defaults)
  assert.equal(defaults.group, 'default')
  assert.equal(defaults.cross_group_retry, false)
  assert.equal(payload.group, 'default')
  assert.equal(payload.cross_group_retry, false)
  assert.equal(payload.model_limits_enabled, true)
  assert.equal(payload.model_limits, 'claude-sonnet-4,gpt-5')
  assert.equal(payload.allow_ips, '192.0.2.1')
  assert.equal(payload.expired_time, 2000000000)
  assert.equal(payload.name, 'Existing key')
})

test('model-family guidance keeps the existing model selection without changing key routing', () => {
  const models = ['gpt-5', 'o3', 'claude-sonnet-4', 'gemini-2.5-pro']
  for (const [modelFamily, expected] of [
    ['openai', ['gpt-5', 'o3']],
    ['anthropic', ['claude-sonnet-4']],
  ] as const) {
    const payload = transformFormDataToPayload({
      ...getApiKeyFormDefaultValues(),
      name: 'Guided key',
      model_limits: getGuideModelLimits({ modelFamily }, models),
    })
    assert.equal(payload.group, 'default')
    assert.equal(payload.cross_group_retry, false)
    assert.equal(payload.model_limits_enabled, true)
    assert.equal(payload.model_limits, expected.join(','))
  }
})

test('create and update requests enforce default even if a stale form supplies a different group', async () => {
  const originalAdapter = api.defaults.adapter
  const requests: { method: string | undefined; data: ApiKeyFormData }[] = []
  api.defaults.adapter = async (config) => {
    requests.push({
      method: config.method,
      data: JSON.parse(config.data as string) as ApiKeyFormData,
    })
    return {
      config,
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { success: true },
    }
  }
  try {
    const payload: ApiKeyFormData = {
      name: 'Existing client',
      remain_quota: 250000,
      expired_time: -1,
      unlimited_quota: false,
      model_limits_enabled: true,
      model_limits: 'gpt-5',
      allow_ips: '192.0.2.2',
      group: 'auto',
      cross_group_retry: true,
    }
    await createApiKey(payload)
    await updateApiKey({ ...payload, id: 12 })
    const normalized = {
      ...payload,
      group: 'default',
      cross_group_retry: false,
    }
    assert.deepEqual(requests, [
      { method: 'post', data: normalized },
      { method: 'put', data: { ...normalized, id: 12 } },
    ])
    assert.equal(payload.group, 'auto')
  } finally {
    api.defaults.adapter = originalAdapter
  }
})
