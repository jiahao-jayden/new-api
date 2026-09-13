import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import type { NavGroup } from '@/components/layout/types'
import { ROLE } from '@/lib/roles'
import { useAuthStore, type AuthUser } from '@/stores/auth-store'

import {
  useIsSidebarModuleVisible,
  useSidebarConfig,
} from './use-sidebar-config'

type NavigationResult = {
  groups: NavGroup[]
  routeVisible: boolean
}

function NavigationProbe(props: { groups: NavGroup[]; url: string }) {
  const groups = useSidebarConfig(props.groups)
  const routeVisible = useIsSidebarModuleVisible(props.url)

  return createElement(
    'output',
    null,
    encodeURIComponent(JSON.stringify({ groups, routeVisible }))
  )
}

function renderNavigationForUser(options: {
  groups: NavGroup[]
  url?: string
  adminConfig?: string
  user?: AuthUser
}): NavigationResult {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  client.setQueryData(['status'], {
    SidebarModulesAdmin: options.adminConfig,
  })

  // Server-rendered Zustand consumers read the initial snapshot, not getState.
  // Seed it explicitly so reintroducing the user overlay fails these tests.
  const initialAuth = useAuthStore.getInitialState().auth
  const originalUser = initialAuth.user
  initialAuth.user = options.user ?? null

  try {
    const markup = renderToStaticMarkup(
      createElement(
        QueryClientProvider,
        { client },
        createElement(NavigationProbe, {
          groups: options.groups,
          url: options.url ?? '/wallet',
        })
      )
    )
    return JSON.parse(
      decodeURIComponent(markup.slice('<output>'.length, -'</output>'.length))
    ) as NavigationResult
  } finally {
    initialAuth.user = originalUser
    client.clear()
  }
}

const personalNavigation: NavGroup[] = [
  {
    id: 'personal',
    title: 'Personal',
    items: [
      { title: 'Wallet', url: '/wallet' },
      { title: 'Profile', url: '/profile' },
    ],
  },
  {
    id: 'console',
    title: 'Console',
    items: [{ title: 'Keys', url: '/keys' }],
  },
]

describe('platform-controlled navigation visibility', () => {
  test('both hooks ignore historical personal preferences for every role', () => {
    for (const role of [ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN]) {
      for (const sidebarSettings of [true, false, undefined]) {
        const user: AuthUser = {
          id: 1,
          username: 'navigation-test',
          role,
          sidebar_modules: JSON.stringify({
            personal: { enabled: false, topup: false, personal: false },
            console: { enabled: false, token: false },
          }),
          permissions: { sidebar_settings: sidebarSettings },
        }

        for (const url of ['/wallet', '/profile', '/keys']) {
          assert.deepEqual(
            renderNavigationForUser({
              groups: personalNavigation,
              url,
              user,
            }),
            { groups: personalNavigation, routeVisible: true }
          )
        }
      }
    }
  })

  test('personal preferences cannot reopen a platform-disabled section or module', () => {
    const options = {
      groups: personalNavigation,
      adminConfig: JSON.stringify({
        personal: { enabled: false },
        console: { token: false },
      }),
      user: {
        id: 1,
        username: 'navigation-test',
        role: ROLE.SUPER_ADMIN,
        sidebar_modules: JSON.stringify({
          personal: { enabled: true, topup: true, personal: true },
          console: { enabled: true, token: true },
        }),
      },
    }

    for (const url of ['/wallet', '/profile', '/keys']) {
      assert.deepEqual(renderNavigationForUser({ ...options, url }), {
        groups: [],
        routeVisible: false,
      })
    }
  })

  test('dynamic chat presets retain the platform section and chat-module gates', () => {
    const groups: NavGroup[] = [
      {
        id: 'chat',
        title: 'Chat',
        items: [
          { title: 'Playground', url: '/playground' },
          { title: 'Chats', type: 'chat-presets' },
        ],
      },
    ]
    const user: AuthUser = {
      id: 1,
      username: 'navigation-test',
      role: ROLE.USER,
      sidebar_modules: JSON.stringify({
        chat: { enabled: false, chat: false, playground: false },
      }),
    }

    assert.deepEqual(renderNavigationForUser({ groups, user }).groups, groups)
    assert.deepEqual(
      renderNavigationForUser({
        groups,
        user,
        adminConfig: JSON.stringify({ chat: { chat: false } }),
      }).groups,
      [{ ...groups[0], items: [groups[0].items[0]] }]
    )
    assert.deepEqual(
      renderNavigationForUser({
        groups,
        user,
        adminConfig: JSON.stringify({ chat: { enabled: false } }),
      }).groups,
      []
    )
  })

  test('filters child routes without losing parent metadata or mutating the source', () => {
    const groups: NavGroup[] = [
      {
        id: 'console',
        title: 'Console',
        items: [
          {
            title: 'Logs',
            requiredRole: ROLE.ADMIN,
            items: [
              { title: 'Requests', url: '/usage-logs/common' },
              { title: 'Drawing', url: '/usage-logs/drawing' },
              { title: 'Tasks', url: '/usage-logs/task' },
            ],
          },
        ],
      },
    ]
    const originalGroups = structuredClone(groups)

    assert.deepEqual(
      renderNavigationForUser({
        groups,
        adminConfig: JSON.stringify({
          console: { log: false, midjourney: true, task: false },
        }),
      }).groups,
      [
        {
          ...groups[0],
          items: [
            {
              ...groups[0].items[0],
              items: [{ title: 'Drawing', url: '/usage-logs/drawing' }],
            },
          ],
        },
      ]
    )
    assert.deepEqual(groups, originalGroups)
    assert.deepEqual(
      renderNavigationForUser({
        groups,
        adminConfig: JSON.stringify({ console: { enabled: false } }),
      }).groups,
      []
    )
  })

  test('keeps grouped navigation available when any configured destination is allowed', () => {
    const groups: NavGroup[] = [
      {
        title: 'Console',
        items: [
          {
            title: 'Workspace',
            url: '/home',
            configUrls: ['/dashboard/models', '/usage-logs/common'],
          },
        ],
      },
    ]

    assert.deepEqual(
      renderNavigationForUser({
        groups,
        adminConfig: JSON.stringify({ console: { detail: false, log: true } }),
      }).groups,
      groups
    )
    assert.deepEqual(
      renderNavigationForUser({
        groups,
        adminConfig: JSON.stringify({ console: { detail: false, log: false } }),
      }).groups,
      []
    )
  })
})
