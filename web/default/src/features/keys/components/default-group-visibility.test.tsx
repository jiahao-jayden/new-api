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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTable, getCoreRowModel } from '@tanstack/react-table'
import { createInstance } from 'i18next'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'

import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

import type { ApiKey } from '../types'
import { ApiKeyInspector } from './api-key-workspace'
import { useApiKeysColumns } from './api-keys-columns'
import { ApiKeysProvider } from './api-keys-provider'

const key: ApiKey = {
  id: 1,
  name: 'Test key',
  key: 'masked',
  status: 1,
  remain_quota: 0,
  used_quota: 0,
  unlimited_quota: true,
  created_time: 1,
  accessed_time: 2,
  expired_time: -1,
  model_limits_enabled: true,
  model_limits: 'claude-sonnet-4',
  allow_ips: '192.0.2.1',
  group: 'default',
  cross_group_retry: true,
}

function ApiKeyInspection() {
  const columns = useApiKeysColumns()
  const table = createTable({
    columns,
    data: [key],
    getCoreRowModel: getCoreRowModel(),
    state: {},
    onStateChange: () => undefined,
    renderFallbackValue: null,
  })
  return (
    <>
      <header>
        {columns.map((column) =>
          typeof column.header === 'string' ? (
            <span key={column.header}>{column.header}</span>
          ) : null
        )}
      </header>
      <ApiKeyInspector row={table.getCoreRowModel().rows[0]} />
    </>
  )
}

test('normal key interfaces omit group concepts while administrators retain read-only group metadata', async () => {
  const i18n = createInstance()
  await i18n.init({ lng: 'en', resources: { en: { translation: {} } } })
  const initialAuth = useAuthStore.getInitialState().auth
  const originalUser = initialAuth.user

  try {
    for (const role of [ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN]) {
      initialAuth.user = { id: 101, username: 'key-test', role }
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: Infinity } },
      })
      try {
        const markup = renderToStaticMarkup(
          <QueryClientProvider client={client}>
            <I18nextProvider i18n={i18n}>
              <ApiKeysProvider>
                <ApiKeyInspection />
              </ApiKeysProvider>
            </I18nextProvider>
          </QueryClientProvider>
        )
        assert.match(markup, /Key details/)
        assert.match(markup, /claude-sonnet-4/)
        assert.match(markup, /192\.0\.2\.1/)
        assert.doesNotMatch(markup, /Cross-group/)
        assert.doesNotMatch(markup, /Select a group/)
        if (role === ROLE.USER) {
          assert.doesNotMatch(markup, />Group</)
          assert.doesNotMatch(markup, />default</)
        } else {
          assert.match(markup, /<span>Group<\/span>/)
          assert.match(markup, /<dt>Group<\/dt>/)
          assert.match(markup, />default<\/dd>/)
        }
      } finally {
        client.clear()
      }
    }
  } finally {
    initialAuth.user = originalUser
  }
})
