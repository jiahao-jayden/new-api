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
import { after, before, test } from 'node:test'

import { createInstance } from 'i18next'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'

import {
  DEFAULT_CONFIG,
  DEFAULT_PARAMETER_ENABLED,
} from '@/features/playground/constants'
import { resolvePlaygroundGroup } from '@/features/playground/lib/options/playground-option-utils'
import { buildChatCompletionPayload } from '@/features/playground/lib/streaming/payload-builder'
import { usePricingColumns } from '@/features/pricing/components/pricing-columns'
import { PricingSidebar } from '@/features/pricing/components/pricing-sidebar'
import { buildApiParams } from '@/features/usage-logs/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

const originalAuth = useAuthStore.getState().auth
const i18n = createInstance()
before(async () => {
  await i18n.init({ lng: 'en', resources: { en: { translation: {} } } })
})
after(() => useAuthStore.setState({ auth: originalAuth }))

function renderAsRole(role: number, element: ReactNode): string {
  useAuthStore.setState({
    auth: { ...originalAuth, user: { id: 101, username: 'group-test', role } },
  })
  // Zustand uses its server snapshot for SSR, so hydrate that snapshot with
  // the same account as the client store for this permission rendering test.
  const initialState = useAuthStore.getInitialState()
  const initialAuth = initialState.auth
  initialState.auth = useAuthStore.getState().auth
  try {
    return renderToStaticMarkup(
      <I18nextProvider i18n={i18n}>{element}</I18nextProvider>
    )
  } finally {
    initialState.auth = initialAuth
  }
}

function CatalogColumns() {
  const columns = usePricingColumns()
  return (
    <>
      {columns.map((column) => (
        <span key={'accessorKey' in column ? column.accessorKey : column.id}>
          {'accessorKey' in column ? column.accessorKey : column.id}
        </span>
      ))}
    </>
  )
}

test('ordinary and guest catalogs expose no group filter or configurable group column; admin retains diagnosis', () => {
  const filters = (
    <PricingSidebar
      quotaTypeFilter='all'
      endpointTypeFilter='all'
      vendorFilter='all'
      groupFilter='legacy-vip'
      tagFilter='all'
      onQuotaTypeChange={() => undefined}
      onEndpointTypeChange={() => undefined}
      onVendorChange={() => undefined}
      onGroupChange={() => undefined}
      onTagChange={() => undefined}
      vendors={[]}
      groups={['legacy-vip']}
      tags={[]}
      models={[]}
      hasActiveFilters={false}
      onClearFilters={() => undefined}
    />
  )
  for (const role of [0, 1]) {
    assert.doesNotMatch(renderAsRole(role, filters), />Groups</)
    assert.doesNotMatch(renderAsRole(role, <CatalogColumns />), /enable_groups/)
  }
  assert.match(renderAsRole(10, filters), />Groups</)
  assert.match(renderAsRole(10, <CatalogColumns />), /enable_groups/)
})

test('normal playground requests override persisted legacy groups without changing the chosen model or parameters', () => {
  const config = {
    ...DEFAULT_CONFIG,
    group: 'legacy-vip',
    model: 'existing-model',
  }
  const payload = buildChatCompletionPayload(
    [],
    {
      ...config,
      group: resolvePlaygroundGroup(config.group, false),
    },
    DEFAULT_PARAMETER_ENABLED
  )
  assert.equal(payload.group, 'default')
  assert.equal(payload.model, 'existing-model')
  assert.equal(payload.stream, config.stream)
  assert.equal(resolvePlaygroundGroup('legacy-vip', true), 'legacy-vip')
})

test('hidden legacy group filters cannot silently filter normal-user logs through URLs or saved columns', () => {
  const config = {
    page: 1,
    pageSize: 20,
    searchParams: { group: 'legacy-vip', model: 'existing-model' },
    columnFilters: [{ id: 'group', value: 'another-group' }],
  }
  const publicParams = buildApiParams({ ...config, isAdmin: false })
  assert.equal(publicParams.group, undefined)
  assert.equal(publicParams.model_name, 'existing-model')
  assert.equal(
    buildApiParams({ ...config, isAdmin: true }).group,
    'another-group'
  )
})
