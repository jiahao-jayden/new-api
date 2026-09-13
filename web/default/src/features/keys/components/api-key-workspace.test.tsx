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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTable, getCoreRowModel } from '@tanstack/react-table'
import { createInstance } from 'i18next'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'

import { formatQuota } from '@/lib/format'

import { API_KEY_STATUS } from '../constants'
import type { ApiKey } from '../types'
import { ApiKeyWorkspaceCard } from './api-key-workspace'
import { ApiKeysProvider } from './api-keys-provider'

const apiKey: ApiKey = {
  id: 23,
  name: 'Production gateway',
  key: '1092********dc03',
  status: API_KEY_STATUS.ENABLED,
  remain_quota: 3750000,
  used_quota: 1250000,
  unlimited_quota: false,
  created_time: 1,
  accessed_time: 2,
  expired_time: -1,
  model_limits_enabled: false,
  model_limits: '',
  allow_ips: '',
  group: 'default',
  cross_group_retry: false,
}

async function renderKeyCard(
  key: ApiKey,
  options: {
    active?: boolean
    selected?: boolean
    selectionMode?: boolean
  } = {}
): Promise<string> {
  const table = createTable({
    columns: [],
    data: [key],
    getCoreRowModel: getCoreRowModel(),
    state: {},
    onStateChange: () => undefined,
    renderFallbackValue: null,
  })
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  const i18n = createInstance()
  await i18n.init({ lng: 'en', resources: { en: { translation: {} } } })

  try {
    return renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <I18nextProvider i18n={i18n}>
          <ApiKeysProvider>
            <ApiKeyWorkspaceCard
              row={table.getCoreRowModel().rows[0]}
              active={options.active ?? false}
              selected={options.selected ?? false}
              selectionMode={options.selectionMode}
              onInspect={() => undefined}
            />
          </ApiKeysProvider>
        </I18nextProvider>
      </QueryClientProvider>
    )
  } finally {
    client.clear()
  }
}

describe('API key inventory card', () => {
  test('keeps the key identity, used quota, and every status visible', async () => {
    for (const [status, label] of [
      [API_KEY_STATUS.ENABLED, 'Enabled'],
      [API_KEY_STATUS.DISABLED, 'Disabled'],
      [API_KEY_STATUS.EXPIRED, 'Expired'],
      [API_KEY_STATUS.EXHAUSTED, 'Exhausted'],
    ] as const) {
      const markup = await renderKeyCard({ ...apiKey, status })

      assert.match(markup, /<h3\b[^>]*>Production gateway<\/h3>/)
      assert.ok(markup.includes('sk-1092********dc03'))
      assert.ok(markup.includes('Used quota'))
      assert.ok(markup.includes(formatQuota(apiKey.used_quota)))
      assert.ok(markup.includes(`>${label}<`))
    }
  })

  test('shows real progress for finite quota, including an empty allowance', async () => {
    const markup = await renderKeyCard(apiKey)
    const progress = markup.match(/<progress\b[^>]*>/)?.[0]
    assert.ok(progress)
    assert.match(progress, /aria-label="Quota"/)
    assert.match(progress, /max="5000000"/)
    assert.match(progress, /value="1250000"/)

    const emptyMarkup = await renderKeyCard({
      ...apiKey,
      used_quota: 0,
      remain_quota: 0,
    })
    const emptyProgress = emptyMarkup.match(/<progress\b[^>]*>/)?.[0]
    assert.ok(emptyProgress)
    assert.match(emptyProgress, /max="1"/)
    assert.match(emptyProgress, /value="0"/)
  })

  test('keeps used quota visible without a progress bar for unlimited keys', async () => {
    const markup = await renderKeyCard({
      ...apiKey,
      unlimited_quota: true,
    })

    assert.ok(markup.includes('Used quota'))
    assert.ok(markup.includes(formatQuota(apiKey.used_quota)))
    assert.doesNotMatch(markup, /<progress\b/)
  })

  test('keeps inspection, menu, and batch selection as separate controls', async () => {
    const normalMarkup = await renderKeyCard(apiKey)
    const normalInspect = normalMarkup.match(
      /<button\b[^>]*aria-label="API Key Production gateway"[^>]*>[\s\S]*?<\/button>/
    )?.[0]
    assert.ok(normalInspect)
    assert.match(normalInspect, /aria-pressed="false"/)
    assert.doesNotMatch(normalInspect, /aria-label="Open menu"/)
    assert.match(normalMarkup, /<button\b[^>]*aria-label="Open menu"/)
    assert.doesNotMatch(normalMarkup, /role="checkbox"/)

    for (const selected of [false, true]) {
      const markup = await renderKeyCard(apiKey, {
        active: true,
        selected,
        selectionMode: true,
      })
      const inspect = markup.match(
        /<button\b[^>]*aria-label="API Key Production gateway"[^>]*>[\s\S]*?<\/button>/
      )?.[0]
      const checkbox = markup.match(/<[^>]+role="checkbox"[^>]*>/)?.[0]
      assert.ok(inspect)
      assert.match(inspect, /aria-pressed="true"/)
      assert.doesNotMatch(inspect, /role="checkbox"/)
      assert.doesNotMatch(inspect, /aria-label="Open menu"/)
      assert.ok(checkbox)
      assert.ok(checkbox.includes(`aria-checked="${selected}"`))
      assert.match(checkbox, /aria-label="Select row Production gateway"/)
      assert.match(markup, /<button\b[^>]*aria-label="Open menu"/)
    }
  })
})
