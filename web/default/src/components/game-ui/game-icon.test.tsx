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
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { GameIcon } from './game-icon'
import * as sharedIcons from './hugeicons'
import * as icons from './icons'

describe('Unity icons', () => {
  test('keeps decorative icons silent and exposes explicit labels and SVG titles', () => {
    const decorative = renderToStaticMarkup(<GameIcon name='key-1' />)
    assert.match(decorative, /aria-hidden="true"/)
    assert.doesNotMatch(decorative, /role="img"/)

    const labelled = renderToStaticMarkup(
      <GameIcon name='key-1' aria-label='API key' />
    )
    assert.match(labelled, /aria-label="API key"/)
    assert.match(labelled, /role="img"/)
    assert.doesNotMatch(labelled, /aria-hidden="true"/)

    const titled = renderToStaticMarkup(
      <icons.Copy>
        <title>Copy API key</title>
      </icons.Copy>
    )
    assert.match(titled, /<title>Copy API key<\/title>/)
    assert.match(titled, /role="img"/)
    assert.doesNotMatch(titled, /aria-hidden="true"/)
  })

  test('preserves native SVG dimensions, inherited color and loading animation classes', () => {
    const markup = renderToStaticMarkup(
      <icons.Loader2
        id='request-progress'
        size={32}
        width={28}
        height={20}
        className='text-primary size-5 animate-spin'
        style={{ color: 'rgb(22, 168, 206)' }}
        aria-label='Loading request'
        data-state='loading'
        absoluteStrokeWidth
      />
    )

    assert.match(markup, /<svg\b/)
    assert.match(markup, /id="request-progress"/)
    assert.match(markup, /width="28"/)
    assert.match(markup, /height="20"/)
    const classes = new Set(markup.match(/class="([^"]*)"/)?.[1].split(/\s+/))
    assert.ok(classes.has('size-5'))
    assert.ok(classes.has('animate-spin'))
    assert.ok(classes.has('text-primary'))
    assert.match(markup, /style="color:rgb\(22, 168, 206\)"/)
    assert.match(markup, /fill="currentColor"/)
    assert.match(markup, /data-state="loading"/)
    assert.doesNotMatch(markup, /absoluteStrokeWidth/)
  })

  test('renders colored item artwork without a monochrome tint mask', () => {
    const markup = renderToStaticMarkup(
      <GameIcon family='items' name='key-gold' size={36} />
    )
    assert.match(markup, /href="\/assets\/unity-ui\/items\/key-gold\.png"/)
    assert.match(markup, /width="36"/)
    assert.doesNotMatch(markup, /<mask\b/)
  })

  test('every exported UI icon requests an available original PNG asset', () => {
    const requests = Object.entries(icons).map(([name, Icon]) => ({
      name,
      markup: renderToStaticMarkup(createElement(Icon)),
    }))
    for (const [name, icon] of Object.entries(sharedIcons)) {
      if (typeof icon !== 'string') continue
      requests.push({
        name,
        markup: renderToStaticMarkup(<sharedIcons.HugeiconsIcon icon={icon} />),
      })
    }

    assert.ok(requests.length > 0)
    for (const request of requests) {
      const source = request.markup.match(/<image\b[^>]*href="([^"]+)"/)?.[1]
      assert.ok(source, `${request.name} must render its artwork`)
      assert.match(source, /^\/assets\/unity-ui\/picto\/[a-z0-9-]+\.png$/)
      const png = readFileSync(
        new URL(`../../../public${source}`, import.meta.url)
      )
      assert.deepEqual(
        [...png.subarray(0, 8)],
        [137, 80, 78, 71, 13, 10, 26, 10],
        `${request.name} must resolve to a PNG, not a missing-resource page`
      )
    }
  })
})
