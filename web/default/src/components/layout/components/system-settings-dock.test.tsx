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

import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from '@tanstack/react-router'
import { createInstance } from 'i18next'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'

import { SYSTEM_SETTINGS_VIEW } from '../config/system-settings.config'
import { SystemSettingsDock } from './system-settings-dock'

const settingsCategories = [
  {
    title: 'Site & Branding',
    path: 'site',
    sections: ['system-info', 'notice', 'header-navigation', 'sidebar-modules'],
  },
  {
    title: 'Authentication',
    path: 'auth',
    sections: [
      'basic-auth',
      'oauth',
      'passkey',
      'bot-protection',
      'custom-oauth',
    ],
  },
  {
    title: 'Billing & Payment',
    path: 'billing',
    sections: [
      'quota',
      'currency',
      'model-pricing',
      'group-pricing',
      'payment',
      'checkin',
    ],
  },
  {
    title: 'Models & Routing',
    path: 'models',
    sections: [
      'global',
      'routing-reliability',
      'gemini',
      'claude',
      'grok',
      'channel-affinity',
      'model-deployment',
    ],
  },
  {
    title: 'Security & Limits',
    path: 'security',
    sections: ['rate-limit', 'sensitive-words', 'ssrf', 'token-limits'],
  },
  {
    title: 'Console Content',
    path: 'content',
    sections: [
      'dashboard',
      'announcements',
      'api-info',
      'faq',
      'uptime-kuma',
      'chat',
      'drawing',
    ],
  },
  {
    title: 'Operations',
    path: 'operations',
    sections: [
      'behavior',
      'alerts',
      'email',
      'worker',
      'logs',
      'performance',
      'update-checker',
    ],
  },
]

function readSettingsLinks(markup: string) {
  return Array.from(
    markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g),
    (match) => {
      const href = match[1].match(/\bhref="([^"]*)"/)?.[1]
      assert.ok(href, 'Every settings navigation link must have a destination')

      return {
        href,
        label: match[2].replaceAll(/<[^>]*>/g, '').replaceAll('&amp;', '&'),
        current: match[1].match(/\baria-current="([^"]*)"/)?.[1],
        ariaLabel: match[1].match(/\baria-label="([^"]*)"/)?.[1],
      }
    }
  )
}

async function renderSettingsDock(pathname: string) {
  const router = createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: [pathname] }),
  })
  const i18n = createInstance()
  await i18n.init({ lng: 'en', resources: { en: { translation: {} } } })

  const markup = renderToStaticMarkup(
    <RouterContextProvider router={router}>
      <I18nextProvider i18n={i18n}>
        <SystemSettingsDock view={SYSTEM_SETTINGS_VIEW} pathname={pathname} />
      </I18nextProvider>
    </RouterContextProvider>
  )

  return {
    links: readSettingsLinks(markup),
    navigation: Array.from(
      markup.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/g),
      (match) => ({
        label: match[1]
          .match(/\baria-label="([^"]*)"/)?.[1]
          .replaceAll('&amp;', '&'),
        links: readSettingsLinks(match[2]),
      })
    ),
  }
}

describe('system settings bottom navigation', () => {
  test('reaches all 40 settings pages through the seven category links without lost or duplicated sections', async () => {
    const initial = await renderSettingsDock(
      '/system-settings/site/system-info'
    )
    const categories = initial.navigation.find(
      (nav) => nav.label === 'System Settings'
    )
    assert.ok(categories)
    assert.deepEqual(
      categories.links.map((link) => ({ label: link.label, href: link.href })),
      settingsCategories.map((category) => ({
        label: category.title,
        href: `/system-settings/${category.path}/${category.sections[0]}`,
      }))
    )

    const reachablePages: string[] = []
    for (const categoryLink of categories.links) {
      const category = settingsCategories.find(
        (entry) => entry.title === categoryLink.label
      )
      assert.ok(category)
      const rendered = await renderSettingsDock(categoryLink.href)
      assert.deepEqual(
        rendered.navigation.map((nav) => nav.label),
        [category.title, 'System Settings']
      )
      const sections = rendered.navigation.find(
        (nav) => nav.label === category.title
      )
      assert.ok(sections)
      const destinations = sections.links.map((link) => link.href)
      assert.deepEqual(
        destinations,
        category.sections.map(
          (section) => `/system-settings/${category.path}/${section}`
        )
      )
      assert.deepEqual(
        sections.links
          .filter((link) => link.current === 'page')
          .map((link) => link.href),
        [categoryLink.href]
      )
      reachablePages.push(...destinations)
    }

    assert.equal(reachablePages.length, 40)
    assert.equal(new Set(reachablePages).size, 40)
  })

  test('marks deep-linked model pricing as active, preserves it on the billing category, and provides a return to the console', async () => {
    const pathname = '/system-settings/billing/model-pricing'
    const rendered = await renderSettingsDock(pathname)
    const categories = rendered.navigation.find(
      (nav) => nav.label === 'System Settings'
    )
    const sections = rendered.navigation.find(
      (nav) => nav.label === 'Billing & Payment'
    )
    assert.ok(categories)
    assert.ok(sections)

    assert.deepEqual(
      categories.links
        .filter((link) => link.current)
        .map((link) => ({
          label: link.label,
          href: link.href,
        })),
      [{ label: 'Billing & Payment', href: pathname }]
    )
    assert.deepEqual(
      sections.links
        .filter((link) => link.current === 'page')
        .map((link) => ({
          label: link.label,
          href: link.href,
        })),
      [{ label: 'Model Pricing', href: pathname }]
    )
    assert.deepEqual(
      rendered.links
        .filter((link) => link.ariaLabel === 'Back to Dashboard')
        .map((link) => link.href),
      ['/dashboard/overview']
    )
  })
})
