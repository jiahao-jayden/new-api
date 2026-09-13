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
import { afterEach, beforeEach, test } from 'node:test'

import { useAuthStore } from '@/stores/auth-store'
import {
  getPreferredCurrency,
  useCurrencyPreferenceStore,
} from '@/stores/currency-preference-store'
import { useSystemConfigStore } from '@/stores/system-config-store'

import { formatQuotaWithCurrency, getCurrencyDisplay } from './currency'

const originalAuth = useAuthStore.getState().auth
const originalPreferences = useCurrencyPreferenceStore.getState().preferences
const originalConfig = useSystemConfigStore.getState().config

beforeEach(() => {
  useCurrencyPreferenceStore.setState({ preferences: {} })
  useAuthStore.setState({
    auth: {
      ...originalAuth,
      user: { id: 1, username: 'one', role: 1, quota: 500000 },
    },
  })
  useSystemConfigStore.setState({
    config: {
      ...originalConfig,
      currency: {
        ...originalConfig.currency,
        quotaDisplayType: 'USD',
        quotaPerUnit: 500000,
        usdExchangeRate: 7.3,
      },
    },
  })
})

afterEach(() => {
  useAuthStore.setState({ auth: originalAuth })
  useCurrencyPreferenceStore.setState({ preferences: originalPreferences })
  useSystemConfigStore.setState({ config: originalConfig })
})

test('CNY is the default presentation even when the server uses legacy USD display', () => {
  assert.equal(getPreferredCurrency(), 'CNY')
  assert.equal(getCurrencyDisplay().config.quotaDisplayType, 'CNY')
  assert.equal(
    formatQuotaWithCurrency(500000, { locale: 'en-US', abbreviate: false }),
    '¥7.3'
  )
  assert.equal(
    useSystemConfigStore.getState().config.currency.quotaDisplayType,
    'USD'
  )
})

test('currency preferences are account-specific and never change stored quota or server configuration', () => {
  const serverCurrency = useSystemConfigStore.getState().config.currency
  useCurrencyPreferenceStore.getState().setPreference(1, 'USD')
  assert.equal(
    formatQuotaWithCurrency(500000, { locale: 'en-US', abbreviate: false }),
    '$1'
  )
  assert.equal(useAuthStore.getState().auth.user?.quota, 500000)
  assert.equal(useSystemConfigStore.getState().config.currency, serverCurrency)

  useAuthStore.setState({
    auth: { ...originalAuth, user: { id: 2, username: 'two', role: 1 } },
  })
  assert.equal(getPreferredCurrency(), 'CNY')
  useAuthStore.setState({ auth: { ...originalAuth, user: null } })
  assert.equal(getPreferredCurrency(), 'CNY')
  useAuthStore.setState({
    auth: { ...originalAuth, user: { id: 1, username: 'one', role: 1 } },
  })
  assert.equal(getPreferredCurrency(), 'USD')
})

test('only account currency choices are persisted and blocked storage remains usable', () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  let savedKey = ''
  let savedValue = ''
  const storage = {
    setItem: (key: string, value: string) => {
      savedKey = key
      savedValue = value
    },
  }
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: storage },
  })
  try {
    useCurrencyPreferenceStore.getState().setPreference(1, 'USD')
    assert.equal(savedKey, 'currency-preferences:v1')
    assert.deepEqual(JSON.parse(savedValue), { 1: 'USD' })
    storage.setItem = () => {
      throw new Error('Storage blocked')
    }
    assert.doesNotThrow(() =>
      useCurrencyPreferenceStore.getState().setPreference(1, 'CNY')
    )
    assert.equal(getPreferredCurrency(), 'CNY')
    useCurrencyPreferenceStore.getState().setPreference(0, 'USD')
    assert.deepEqual(useCurrencyPreferenceStore.getState().preferences, {
      1: 'CNY',
    })
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', originalWindow)
    } else {
      Reflect.deleteProperty(globalThis, 'window')
    }
  }
})
