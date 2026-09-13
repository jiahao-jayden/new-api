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

import { createInstance } from 'i18next'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'

import { GroupRatioVisualEditor } from './group-ratio-visual-editor'

test('routing groups retain routing and legacy topup controls without obsolete model-price editors', async () => {
  const i18n = createInstance()
  await i18n.init({ lng: 'en', resources: { en: { translation: {} } } })
  const changes: string[] = []
  const markup = renderToStaticMarkup(
    <I18nextProvider i18n={i18n}>
      <GroupRatioVisualEditor
        groupRatio='{"default":0.3,"fallback":0.5}'
        groupGroupRatio='{"vip":{"default":0.1}}'
        topupGroupRatio='{"default":0.9}'
        userUsableGroups='{"default":"Standard","fallback":"Fallback"}'
        autoGroups='["default","fallback"]'
        groupSpecialUsableGroup='{}'
        onChange={(field) => changes.push(field)}
      />
    </I18nextProvider>
  )
  assert.match(markup, /Routing groups/)
  assert.match(markup, /Top-up ratio/)
  assert.match(markup, /User selectable/)
  assert.match(markup, /Auto assignment order/)
  assert.match(markup, /value="default"/)
  assert.match(markup, /value="0\.9"/)
  assert.doesNotMatch(markup, /value="0\.3"/)
  assert.doesNotMatch(markup, /value="0\.5"/)
  assert.doesNotMatch(markup, /Special ratio rules/)
  assert.doesNotMatch(markup, /Ratio applies when calls are billed/)
  assert.deepEqual(changes, [])
})
