import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  API_KEY_FORM_DEFAULT_VALUES,
  transformFormDataToPayload,
} from './api-key-form'

describe('API key model limits', () => {
  test('defaults new API keys to unrestricted models', () => {
    assert.equal(API_KEY_FORM_DEFAULT_VALUES.model_limits_enabled, false)

    const payload = transformFormDataToPayload({
      ...API_KEY_FORM_DEFAULT_VALUES,
      name: 'Dot-1',
      model_limits: ['gpt-5'],
    })

    assert.equal(payload.model_limits_enabled, false)
    assert.equal(payload.model_limits, '')
  })

  test('only sends selected models when restrictions are enabled', () => {
    const payload = transformFormDataToPayload({
      ...API_KEY_FORM_DEFAULT_VALUES,
      name: 'Dot-1',
      model_limits_enabled: true,
      model_limits: ['gpt-5', 'claude-sonnet'],
    })

    assert.equal(payload.model_limits_enabled, true)
    assert.equal(payload.model_limits, 'gpt-5,claude-sonnet')
  })

  test('keeps the selected guide group while leaving models unrestricted', () => {
    const payload = transformFormDataToPayload({
      ...API_KEY_FORM_DEFAULT_VALUES,
      name: 'Dot-1',
      group: 'claude',
      model_limits_enabled: false,
      model_limits: ['claude-sonnet'],
    })

    assert.equal(payload.group, 'claude')
    assert.equal(payload.model_limits_enabled, false)
    assert.equal(payload.model_limits, '')
  })
})
