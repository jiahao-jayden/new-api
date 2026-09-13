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
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  buildNeutralAdapters,
  createNeutralAdapter,
} from './build-unity-neutral.mjs'

const frontendRoot = new URL('../', import.meta.url)
const manifest = JSON.parse(
  await readFile(
    new URL('../../docs/unity-ui-assets.json', frontendRoot),
    'utf8'
  )
)
const originalColorSurfaces = new Set([
  'button-primary',
  'button-success',
  'button-warning',
  'progress-fill',
  'progress-fill-thin',
  'card-focus',
  'product-back-blue',
  'product-back-green',
  'product-back-yellow',
  'product-back-purple',
])

test('neutral adapters preserve the complete original image bytes and nine-slice geometry', async () => {
  const outputs = await buildNeutralAdapters({ check: true })
  for (const asset of manifest.assets) {
    const svg = outputs.get(`neutral/${asset.name}.svg`)
    if (!svg) continue
    const original = await readFile(new URL(`public${asset.url}`, frontendRoot))
    const embedded = Buffer.from(
      svg.match(/href="data:image\/png;base64,([A-Za-z0-9+/=]+)"/)[1],
      'base64'
    )
    assert.deepEqual(embedded, original, asset.name)
    assert.equal(
      createHash('sha256').update(embedded).digest('hex'),
      asset.sha256,
      asset.name
    )
    assert.ok(
      svg.includes(
        `width="${asset.width}" height="${asset.height}" viewBox="0 0 ${asset.width} ${asset.height}"`
      ),
      asset.name
    )
    assert.ok(
      svg.includes(
        `<image width="${asset.width}" height="${asset.height}" preserveAspectRatio="none"`
      ),
      asset.name
    )
    const metadata = JSON.parse(
      svg
        .match(/<metadata>(.*?)<\/metadata>/s)[1]
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&amp;', '&')
    )
    assert.deepEqual(metadata.source, {
      url: asset.url,
      sha256: asset.sha256,
      originalAssetSha256: asset.source.sha256,
      pathname: asset.source.pathname,
    })
    assert.deepEqual(metadata.geometry, {
      width: asset.width,
      height: asset.height,
      nineSlice: asset.css ?? null,
    })
    let gain = asset.name === 'nav-selected' ? 0.5 : 1
    const semanticDanger = asset.name === 'button-danger'
    if (semanticDanger) gain = 0.68
    assert.deepEqual(metadata.transformation, {
      kind: 'approved-runtime-paint',
      mode: semanticDanger ? 'semantic-danger-contrast' : 'neutral-structural',
      scope: 'embedded-image-only',
      colorSpace: 'sRGB',
      saturation: semanticDanger ? 1 : 0,
      luminanceGain: gain,
      alpha: 'unchanged',
    })
    assert.equal(svg, createNeutralAdapter(asset, original), asset.name)
  }
})

test('structural surfaces are neutral and only the approved danger fill adapts semantic artwork', async () => {
  const outputs = await buildNeutralAdapters({ check: true })
  const expected = manifest.assets
    .filter(
      (asset) =>
        (asset.category === 'surfaces' &&
          !originalColorSurfaces.has(asset.name)) ||
        (asset.category === 'controls' &&
          ['checkbox-off', 'radio-off', 'switch-off'].includes(asset.name))
    )
    .map((asset) => `neutral/${asset.name}.svg`)
    .sort()
  assert.deepEqual(
    [...outputs.keys()].filter((name) => name.endsWith('.svg')).sort(),
    expected
  )
  const css = outputs.get('unity-neutral.css')
  const declarations = [
    ...css.matchAll(/--game-([a-z-]+)-image: url\('([^']+)'\);/g),
  ]
  assert.equal(declarations.length, expected.length)
  for (const [, name, url] of declarations) {
    assert.ok(expected.includes(`neutral/${name}.svg`))
    assert.equal(url, `/assets/unity-ui/neutral/${name}.svg`)
  }
  for (const asset of manifest.assets) {
    if (expected.includes(`neutral/${asset.name}.svg`)) continue
    assert.ok(!css.includes(`--game-${asset.name}-image:`), asset.name)
    assert.ok(!outputs.has(`neutral/${asset.name}.svg`), asset.name)
  }
})

test('paint stays image-local, preserves alpha and uses sRGB to avoid accidental brightening', async () => {
  const outputs = await buildNeutralAdapters({ check: true })
  for (const [name, svg] of outputs) {
    if (!name.endsWith('.svg')) continue
    assert.ok(
      svg.includes(
        'filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"'
      )
    )
    const semanticDanger = name === 'neutral/button-danger.svg'
    assert.equal(
      svg.includes('<feColorMatrix type="saturate" values="0" />'),
      !semanticDanger
    )
    assert.equal((svg.match(/<image /g) ?? []).length, 1)
    assert.equal((svg.match(/filter="url\(#neutral\)"/g) ?? []).length, 1)
    // Saturation preserves alpha by definition. The optional RGB gain must keep
    // the alpha row exactly [0, 0, 0, 1, 0], with no other filtering primitives.
    const matrices = [
      ...svg.matchAll(/<feColorMatrix type="matrix" values="([^"]+)"/g),
    ]
    if (name === 'neutral/nav-selected.svg' || semanticDanger) {
      const gain = semanticDanger ? 0.68 : 0.5
      assert.equal(matrices.length, 1)
      assert.deepEqual(matrices[0][1].split(' ').map(Number), [
        gain,
        0,
        0,
        0,
        0,
        0,
        gain,
        0,
        0,
        0,
        0,
        0,
        gain,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
      ])
    } else {
      assert.equal(matrices.length, 0, name)
    }
    assert.deepEqual(
      new Set([...svg.matchAll(/<(fe[A-Za-z]+)/g)].map((match) => match[1])),
      new Set(['feColorMatrix'])
    )
  }
  const css = outputs
    .get('unity-neutral.css')
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .trim()
  assert.match(
    css,
    /^html:root:where\(:not\(:has\(\[data-original-website\]\)\)\) \{[^{}]*\}$/
  )
  const body = css.slice(css.indexOf('{') + 1, css.lastIndexOf('}'))
  assert.equal(
    body.replaceAll(/\s*--game-[a-z-]+-image: url\('[^']+'\);/g, '').trim(),
    ''
  )
})

test('adapters reject semantic artwork, source mutations and mismatched geometry', async () => {
  const source = manifest.assets.find((asset) => asset.name === 'panel')
  const bytes = await readFile(new URL(`public${source.url}`, frontendRoot))
  const changed = Buffer.from(bytes)
  changed[changed.length - 1] ^= 1
  assert.throws(
    () => createNeutralAdapter(source, changed),
    /source hash mismatch/
  )
  assert.throws(
    () => createNeutralAdapter({ ...source, width: source.width + 1 }, bytes),
    /source dimensions mismatch/
  )
  for (const name of [
    'button-primary',
    'checkbox-on',
    'notification',
    'rocket',
  ]) {
    const asset = manifest.assets.find((item) => item.name === name)
    assert.throws(
      () => createNeutralAdapter(asset, bytes),
      /outside the approved paint adapters/
    )
  }
})

test('red danger artwork supports white labels across its body and dimmed interaction states', async () => {
  const asset = manifest.assets.find((item) => item.name === 'button-danger')
  // These are measured source pixels, tied to the immutable image hash. The
  // brightest opaque pixel bounds every label-bearing body pixel, including
  // its bevel; a separate center sample protects the stretched nine-slice fill.
  assert.equal(
    asset.sha256,
    '693b6ccab7e03dfe7a0eb8dca775bf2dc407bb4ba032a8558ae24e08bdec2044'
  )
  const sourcePixels = [
    [255, 98, 93],
    [255, 107, 101],
    [255, 112, 106],
  ]
  const outputs = await buildNeutralAdapters({ check: true })
  const svg = outputs.get('neutral/button-danger.svg')
  const matrix = svg
    .match(/<feColorMatrix type="matrix" values="([^"]+)"/)[1]
    .split(' ')
    .map(Number)
  for (const brightness of [1, 0.96, 0.9607843, 0.886, 0.8862745]) {
    for (const source of sourcePixels) {
      const background = source.map((channel, index) =>
        Math.ceil(channel * matrix[index * 6] * brightness)
      )
      const foreground = [255, 255, 255].map((channel) =>
        Math.floor(channel * brightness)
      )
      const luminances = [background, foreground].map((rgb) =>
        rgb
          .map((channel) => channel / 255)
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
      const contrast = (luminances[1] + 0.05) / (luminances[0] + 0.05)
      assert.ok(
        contrast >= 4.8,
        `White label contrast ${contrast} for source ${source} at brightness ${brightness}`
      )
      assert.ok(
        background[0] > background[1] && background[1] > background[2],
        'Danger paint must remain red'
      )
    }
  }
})
