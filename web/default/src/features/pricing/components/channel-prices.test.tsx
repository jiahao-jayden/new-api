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
import { after, before, describe, test } from 'node:test'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createInstance } from 'i18next'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'

import { useAuthStore } from '@/stores/auth-store'
import { useCurrencyPreferenceStore } from '@/stores/currency-preference-store'

import type { PricingModel } from '../types'
import { ModelCard } from './model-card'
import { ModelDetailsPricing } from './model-details-pricing'

const model: PricingModel = {
  id: 3,
  model_name: 'channel-discount-model',
  quota_type: 0,
  model_ratio: 5,
  completion_ratio: 3,
  enable_groups: ['default'],
  channel_discount_min: 0.3,
  channel_discount_max: 0.5,
  channel_count: 2,
}

async function renderPricing(element: ReactNode): Promise<string> {
  const i18n = createInstance()
  await i18n.init({
    lng: 'en',
    resources: {
      en: {
        translation: {
          'Original-price discount': '{{percent}}% of original',
          'Lowest original-price discount': 'From {{percent}}% of original',
          'Original-price discount range':
            '{{percent}}%–{{maxPercent}}% of original',
        },
      },
    },
  })
  const client = new QueryClient()
  try {
    return renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <I18nextProvider i18n={i18n}>{element}</I18nextProvider>
      </QueryClientProvider>
    )
  } finally {
    client.clear()
  }
}

describe('rendered channel prices', () => {
  const originalAuth = useAuthStore.getState().auth
  const originalPreferences = useCurrencyPreferenceStore.getState().preferences
  before(() => {
    useAuthStore.setState({
      auth: {
        ...originalAuth,
        user: { id: 101, username: 'pricing-test', role: 1 },
      },
    })
    useCurrencyPreferenceStore.setState({ preferences: { '101': 'USD' } })
  })
  after(() => {
    useAuthStore.setState({ auth: originalAuth })
    useCurrencyPreferenceStore.setState({ preferences: originalPreferences })
  })

  test('multi-channel card shows the lowest rate and both original and final prices', async () => {
    const markup = await renderPricing(
      <ModelCard model={model} onClick={() => undefined} />
    )
    assert.match(markup, /From 30% of original/)
    assert.match(markup, /<strong>\$3<\/strong>/)
    assert.match(markup, /<strong>\$9<\/strong>/)
    assert.match(markup, /Official \$10 \/ \$30/)
    assert.doesNotMatch(markup, /Save 70%/)
  })

  test('inline details show the channel discount and monetary ranges without group multipliers', async () => {
    const markup = await renderPricing(
      <ModelDetailsPricing
        model={model}
        tokenUnit='M'
        priceRate={1}
        usdExchangeRate={1}
        showRechargePrice={false}
      />
    )
    assert.match(markup, /30%–50% of original/)
    assert.match(markup, /<strong>\$3 – \$5<\/strong>/)
    assert.match(markup, /<strong>\$9 – \$15<\/strong>/)
    assert.doesNotMatch(markup, /Group Ratio/)
  })

  test('single-channel details render one amount rather than a duplicated range', async () => {
    const markup = await renderPricing(
      <ModelDetailsPricing
        model={{ ...model, channel_count: 1, channel_discount_max: 0.3 }}
        tokenUnit='M'
        priceRate={1}
        usdExchangeRate={1}
        showRechargePrice={false}
      />
    )
    assert.match(markup, /30% of original/)
    assert.match(markup, /<strong>\$3<\/strong>/)
    assert.doesNotMatch(markup, /\$3 – \$3/)
  })

  test('dynamic cards retain original tier prices and display the channel-discounted prices', async () => {
    const dynamic = {
      ...model,
      billing_mode: 'tiered_expr',
      billing_expr: 'tier("base", p * 10 + c * 30)',
    }
    const markup = await renderPricing(
      <ModelCard model={dynamic} onClick={() => undefined} />
    )
    assert.match(markup, /From 30% of original/)
    assert.match(markup, /<strong>\$3<\/strong>/)
    assert.match(markup, /Official \$10 \/ \$30/)
  })
})
