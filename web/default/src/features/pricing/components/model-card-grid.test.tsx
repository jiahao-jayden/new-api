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
import { createInstance } from 'i18next'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'

import type { PricingModel } from '../types'
import { ModelCardGrid, type ModelCardGridProps } from './model-card-grid'

const models: PricingModel[] = [
  'alpha',
  'bravo',
  'charlie',
  'delta',
  'echo',
  'foxtrot',
  'golf',
].map((modelName, index) => ({
  id: index + 1,
  model_name: modelName,
  quota_type: 0,
  model_ratio: 1,
  completion_ratio: 1,
  enable_groups: ['default'],
  group_ratio: { default: 1 },
}))

async function renderModelCatalog(
  props: Omit<ModelCardGridProps, 'onModelClick'>
): Promise<string> {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  const i18n = createInstance()
  await i18n.init({
    lng: 'en',
    resources: { en: { translation: {} } },
  })

  try {
    return renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <I18nextProvider i18n={i18n}>
          <ModelCardGrid {...props} onModelClick={() => undefined} />
        </I18nextProvider>
      </QueryClientProvider>
    )
  } finally {
    client.clear()
  }
}

describe('continuous model catalog', () => {
  test('renders all models in order and selects a model beyond the former first page', async () => {
    const markup = await renderModelCatalog({
      models,
      selectedModelName: 'foxtrot',
    })
    const cards = Array.from(
      markup.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g),
      (match) => ({
        name: match[1].match(/<h3\b[^>]*>([^<]*)<\/h3>/)?.[1],
        selected: match[1].includes('aria-pressed="true"'),
      })
    )

    assert.deepEqual(cards, [
      { name: 'alpha', selected: false },
      { name: 'bravo', selected: false },
      { name: 'charlie', selected: false },
      { name: 'delta', selected: false },
      { name: 'echo', selected: false },
      { name: 'foxtrot', selected: true },
      { name: 'golf', selected: false },
    ])
  })

  test('renders exactly the supplied filtered models in their current sort order', async () => {
    const markup = await renderModelCatalog({
      models: [models[6], models[1]],
      selectedModelName: 'foxtrot',
    })

    assert.deepEqual(
      Array.from(
        markup.matchAll(/<h3\b[^>]*>([^<]*)<\/h3>/g),
        (match) => match[1]
      ),
      ['golf', 'bravo']
    )
    assert.equal(markup.includes('aria-pressed="true"'), false)
  })

  test('renders no cards or pagination when the result is empty', async () => {
    assert.equal(await renderModelCatalog({ models: [] }), '')
  })
})
