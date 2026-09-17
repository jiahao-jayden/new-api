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

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { GameIcon } from './game-icon'
import * as sharedIcons from './hugeicons'
import * as icons from './icons'

describe('Compatible Untitled icons', () => {
  test('keeps decorative icons silent and exposes explicit labels and SVG titles', () => {
    const decorative = renderToStaticMarkup(<GameIcon name='key-1' />)
    assert.match(decorative, /aria-hidden="true"/)
    assert.doesNotMatch(decorative, /role="img"/)

    const labelled = renderToStaticMarkup(
      <GameIcon name='key-1' aria-label='API key' />
    )
    assert.match(labelled, /aria-label="API key"/)
    assert.match(labelled, /role="img"/)
    assert.doesNotMatch(labelled, /^<svg\b[^>]*aria-hidden="true"/)

    const titled = renderToStaticMarkup(
      <icons.Copy>
        <title>Copy API key</title>
      </icons.Copy>
    )
    assert.match(titled, /<title>Copy API key<\/title>/)
    assert.match(titled, /role="img"/)
    assert.doesNotMatch(titled, /^<svg\b[^>]*aria-hidden="true"/)

    const described = renderToStaticMarkup(
      <GameIcon
        name='key-1'
        aria-labelledby='key-title'
        aria-describedby='key-description'
      >
        <title id='key-title'>API key</title>
        <desc id='key-description'>Used for model requests</desc>
      </GameIcon>
    )
    assert.match(described, /^<svg\b[^>]*aria-labelledby="key-title"/)
    assert.match(described, /^<svg\b[^>]*aria-describedby="key-description"/)
    assert.match(described, /<title id="key-title">API key<\/title>/)
    assert.match(
      described,
      /<desc id="key-description">Used for model requests<\/desc>/
    )
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
    assert.match(markup, /stroke="currentColor"/)
    assert.match(markup, /data-state="loading"/)
    assert.doesNotMatch(markup, /absoluteStrokeWidth/)
  })

  test('accepts legacy item names and dimensions while rendering vector artwork', () => {
    const markup = renderToStaticMarkup(
      <GameIcon family='items' name='key-gold' size={36} />
    )
    assert.match(markup, /<path\b[^>]*d="[^"]+"/)
    assert.match(markup, /width="36"/)
    assert.match(markup, /data-game-icon="items\/key-gold"/)
    assert.doesNotMatch(markup, /<(?:mask|image)\b|\.png/)
  })

  test('every exported UI icon renders vector artwork without a raster request', () => {
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
      assert.match(
        request.markup,
        /<(?:path|circle|rect|line|polyline|polygon|ellipse)\b/,
        `${request.name} must render its artwork`
      )
      assert.doesNotMatch(
        request.markup,
        /<image\b|\.png/,
        `${request.name} must not request legacy raster artwork`
      )
    }
  })

  test('keeps formerly missing navigation and activity icons visually distinct', () => {
    const names = ['home', 'scroll-1-stats', 'document', 'gear', 'fire']
    const paths = names.map((name) => {
      const markup = renderToStaticMarkup(<GameIcon name={name} />)
      return markup.match(/<path\b[^>]*d="([^"]+)"/)?.[1]
    })
    assert.ok(paths.every(Boolean))
    assert.equal(new Set(paths).size, names.length)
  })
})
