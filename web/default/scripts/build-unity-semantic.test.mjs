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
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  buildSemanticAdapters,
  createSemanticAdapter,
  semanticPaints,
} from './build-unity-semantic.mjs'

const frontendRoot = new URL('../', import.meta.url)
const manifest = JSON.parse(
  await readFile(
    new URL('../../docs/unity-ui-assets.json', frontendRoot),
    'utf8'
  )
)

test('semantic paints preserve source artwork, alpha and slice geometry without repainting pages', async () => {
  const outputs = await buildSemanticAdapters({ check: true })
  for (const [role, paint] of Object.entries(semanticPaints)) {
    const asset = manifest.assets.find((item) => item.name === paint.source)
    const original = await readFile(new URL(`public${asset.url}`, frontendRoot))
    const svg = outputs.get(`semantic/${role}.svg`)
    const embedded = Buffer.from(
      svg.match(/href="data:image\/png;base64,([A-Za-z0-9+/=]+)"/)[1],
      'base64'
    )
    assert.deepEqual(embedded, original, role)
    const metadata = JSON.parse(
      svg
        .match(/<metadata>(.*?)<\/metadata>/s)[1]
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&amp;', '&')
    )
    assert.deepEqual(metadata.geometry, {
      width: asset.width,
      height: asset.height,
      nineSlice: asset.css,
    })
    assert.equal(metadata.source.sha256, asset.sha256)
    assert.equal(metadata.source.originalAssetSha256, asset.source.sha256)
    assert.equal(metadata.transformation.scope, 'embedded-image-only')
    assert.match(svg, /color-interpolation-filters="sRGB"/)
    assert.match(svg, /<feFuncA type="identity" \/>/)
    assert.equal((svg.match(/<image /g) ?? []).length, 1)
    assert.equal((svg.match(/filter="url\(#paint\)"/g) ?? []).length, 1)
  }
  const css = outputs
    .get('unity-semantic.css')
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .trim()
  assert.match(
    css,
    /^html:root:where\(:not\(:has\(\[data-original-website\]\)\)\) \{[^{}]*\}$/
  )
  const declarations = css.slice(css.indexOf('{') + 1, css.lastIndexOf('}'))
  assert.equal(
    declarations
      .replaceAll(
        /\s*--game-semantic-[a-z-]+-(?:image|label|muted): [^;]+;/g,
        ''
      )
      .trim(),
    ''
  )
})

test('semantic control labels meet AA across the whole tonal envelope and Unity interaction dimming', () => {
  for (const [role, paint] of Object.entries(semanticPaints)) {
    if (!paint.label) continue
    // Each channel increases monotonically from low to high. These endpoints
    // bound contrast for all original pixels, including the stretched body.
    for (const background of [paint.low, paint.high]) {
      for (const label of [paint.label, paint.muted].filter(Boolean)) {
        for (const brightness of [1, 0.96, 0.886]) {
          const luminance = [background, label].map((hex) =>
            [1, 3, 5]
              .map(
                (index) =>
                  (Number.parseInt(hex.slice(index, index + 2), 16) / 255) *
                  brightness
              )
              .map((channel) =>
                channel <= 0.04045
                  ? channel / 12.92
                  : ((channel + 0.055) / 1.055) ** 2.4
              )
              .reduce(
                (sum, channel, index) =>
                  sum + channel * [0.2126, 0.7152, 0.0722][index],
                0
              )
          )
          const ratio =
            (Math.max(...luminance) + 0.05) / (Math.min(...luminance) + 0.05)
          assert.ok(
            ratio >= 4.5,
            `${role}: ${ratio.toFixed(2)}:1 at ${background}, brightness ${brightness}`
          )
        }
      }
    }
  }
})

test('semantic adapter refuses altered originals and unapproved source or role', async () => {
  const asset = manifest.assets.find((item) => item.name === 'button-secondary')
  const bytes = await readFile(new URL(`public${asset.url}`, frontendRoot))
  const changed = Buffer.from(bytes)
  changed[changed.length - 1] ^= 1
  assert.throws(
    () => createSemanticAdapter(asset, changed, 'alipay'),
    /hash mismatch/
  )
  assert.throws(
    () =>
      createSemanticAdapter(
        { ...asset, width: asset.width + 1 },
        bytes,
        'alipay'
      ),
    /dimensions mismatch/
  )
  assert.throws(
    () => createSemanticAdapter(asset, bytes, 'entire-page'),
    /approved original source/
  )
  assert.throws(
    () => createSemanticAdapter({ ...asset, name: 'panel' }, bytes, 'wechat'),
    /approved original source/
  )
})
