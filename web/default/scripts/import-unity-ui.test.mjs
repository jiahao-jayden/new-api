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
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  embedPngOrigin,
  measureSpriteCenter,
  normalizeNineSlice,
  parseSpriteMetadata,
  readPngChunks,
  spriteCss,
} from './import-unity-ui.mjs'

test('zero-width and zero-height centers gain the bilinear boundary color without changing any source corner', () => {
  const source = {
    width: 2,
    height: 2,
    data: Buffer.from([
      0, 20, 40, 0, 100, 120, 140, 100, 200, 220, 240, 200, 40, 60, 80, 240,
    ]),
  }
  const normalized = normalizeNineSlice(source, {
    left: 1,
    bottom: 1,
    right: 1,
    top: 1,
  })
  assert.equal(normalized.width, 4)
  assert.equal(normalized.height, 4)
  assert.equal(normalized.insertedColumns, 2)
  assert.equal(normalized.insertedRows, 2)
  assert.deepEqual(
    normalized.data,
    Buffer.from([
      0, 20, 40, 0, 50, 70, 90, 50, 50, 70, 90, 50, 100, 120, 140, 100, 100,
      120, 140, 100, 85, 105, 125, 135, 85, 105, 125, 135, 70, 90, 110, 170,
      100, 120, 140, 100, 85, 105, 125, 135, 85, 105, 125, 135, 70, 90, 110,
      170, 200, 220, 240, 200, 120, 140, 160, 220, 120, 140, 160, 220, 40, 60,
      80, 240,
    ])
  )
})

test('one-axis normalization preserves a nonempty center and uses the top border rather than Unity bottom', () => {
  const source = {
    width: 1,
    height: 3,
    data: Buffer.from([0, 20, 40, 255, 100, 120, 140, 255, 200, 220, 240, 255]),
  }
  const normalized = normalizeNineSlice(source, {
    left: 0,
    bottom: 2,
    right: 0,
    top: 1,
  })
  assert.equal(normalized.width, 1)
  assert.equal(normalized.height, 5)
  assert.deepEqual(
    normalized.data,
    Buffer.from([
      0, 20, 40, 255, 50, 70, 90, 255, 50, 70, 90, 255, 100, 120, 140, 255, 200,
      220, 240, 255,
    ])
  )
})

test('unsliced icon pixels remain exact and invalid borders fail before conversion', () => {
  const source = {
    width: 2,
    height: 1,
    data: Buffer.from([0, 20, 40, 100, 100, 120, 140, 200]),
  }
  const result = normalizeNineSlice(source, {
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
  })
  assert.equal(result.data, source.data)
  assert.equal(result.insertedColumns, 0)
  assert.equal(result.insertedRows, 0)
  assert.throws(
    () => normalizeNineSlice(source, { left: 2, bottom: 0, right: 1, top: 0 }),
    /within the image/
  )
  assert.throws(
    () => normalizeNineSlice(source, { left: -1, bottom: 0, right: 1, top: 0 }),
    /nonnegative/
  )
})

test('Unity border orientation converts to CSS top/right/bottom/left with independently scaled display widths', () => {
  const sprite = parseSpriteMetadata(
    'guid: 19f84389193584d7ab2d7846ae4c8ede\n  spriteBorder: {x: 47, y: 70, z: 47, w: 68}\n  spriteID: 5e97eb03825dee720800000000000000\n  spritePivot: {x: 0.5, y: 0.5}\n  spritePixelsToUnits: 100\n    filterMode: 1\n'
  )
  assert.deepEqual(sprite.border, { left: 47, bottom: 70, right: 47, top: 68 })
  assert.deepEqual(spriteCss({ source: { sprite }, borderScale: 0.25 }), {
    slice: '68 47 70 47',
    width: '17px 11.75px 17.5px 11.75px',
  })
})

test('surface audit rejects white content masks while preserving dark and transparent original centers', () => {
  const border = { left: 0, bottom: 0, right: 0, top: 0 }
  const white = measureSpriteCenter(
    { width: 1, height: 1, data: Buffer.from([255, 255, 255, 255]) },
    border
  )
  assert.equal(white.whiteTextMinContrast, 1)
  for (const pixel of [
    [27, 41, 62, 255],
    [255, 255, 255, 0],
  ]) {
    const appearance = measureSpriteCenter(
      { width: 1, height: 1, data: Buffer.from(pixel) },
      border
    )
    assert.ok(appearance.whiteTextMinContrast > 10)
  }
})

test('every published asset matches its provenance and every CSS nine-slice has a drawable center', async () => {
  const frontendRoot = fileURLToPath(new URL('..', import.meta.url))
  const manifest = JSON.parse(
    await readFile(
      path.resolve(frontendRoot, '../../docs/unity-ui-assets.json'),
      'utf8'
    )
  )
  const css = await readFile(
    path.join(frontendRoot, 'public/assets/unity-ui/unity-ui.css'),
    'utf8'
  )
  const urls = new Set()
  assert.ok(manifest.assets.length > 0)
  assert.match(manifest.sourcePackage.sha256, /^[a-f0-9]{64}$/)
  for (const asset of manifest.assets) {
    assert.ok(!urls.has(asset.url), `Duplicate URL: ${asset.url}`)
    urls.add(asset.url)
    assert.match(
      asset.url,
      /^\/assets\/unity-ui\/(surfaces|controls|picto|items|fonts)\/[a-z0-9-]+\.(png|ttf)$/
    )
    assert.match(asset.source.guid, /^[a-f0-9]{32}$/)
    assert.match(asset.source.sha256, /^[a-f0-9]{64}$/)
    const bytes = await readFile(path.join(frontendRoot, 'public', asset.url))
    assert.equal(bytes.length, asset.bytes, asset.url)
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      asset.sha256,
      asset.url
    )
    if (asset.category === 'fonts') {
      assert.equal(
        asset.sha256,
        asset.source.sha256,
        `Font must remain original: ${asset.url}`
      )
      assert.ok(css.includes(`url('${asset.url}')`))
      continue
    }
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', asset.url)
    assert.equal(bytes.readUInt32BE(16), asset.width, asset.url)
    assert.equal(bytes.readUInt32BE(20), asset.height, asset.url)
    const chunks = readPngChunks(bytes)
    const originPrefix = Buffer.from(`${asset.pngProvenance.keyword}\0`)
    const originChunks = chunks.filter(
      (chunk) =>
        chunk.type === 'tEXt' &&
        chunk.data.subarray(0, originPrefix.length).equals(originPrefix)
    )
    assert.equal(
      originChunks.length,
      1,
      `One embedded origin required: ${asset.url}`
    )
    const origin = originChunks[0].data
      .subarray(originPrefix.length)
      .toString('ascii')
    assert.equal(origin, asset.pngProvenance.origin, asset.url)
    const identity = JSON.parse(origin)
    assert.equal(identity.kind, 'sourced-original-artwork')
    assert.equal(identity.pathname, asset.source.pathname)
    assert.equal(identity.guid, asset.source.guid)
    assert.equal(identity.sourceSha256, asset.source.sha256)
    const imagePayload = Buffer.concat([
      bytes.subarray(0, 8),
      ...chunks
        .filter((chunk) => !originChunks.includes(chunk))
        .map((chunk) => chunk.bytes),
    ])
    assert.equal(
      createHash('sha256').update(imagePayload).digest('hex'),
      asset.pngProvenance.imagePayloadSha256,
      `Metadata insertion changed original PNG chunks: ${asset.url}`
    )
    assert.deepEqual(embedPngOrigin(imagePayload, origin), bytes, asset.url)
    assert.deepEqual(
      embedPngOrigin(bytes, origin),
      bytes,
      `Origin insertion must be idempotent: ${asset.url}`
    )
    const border = asset.source.sprite.border
    assert.equal(
      asset.width,
      asset.source.width + asset.normalization.insertedColumns,
      asset.url
    )
    assert.equal(
      asset.height,
      asset.source.height + asset.normalization.insertedRows,
      asset.url
    )
    assert.ok(
      asset.width > border.left + border.right,
      `Empty CSS horizontal center: ${asset.url}`
    )
    assert.ok(
      asset.height > border.top + border.bottom,
      `Empty CSS vertical center: ${asset.url}`
    )
    if (
      !asset.normalization.insertedColumns &&
      !asset.normalization.insertedRows
    ) {
      assert.equal(
        asset.pngProvenance.imagePayloadSha256,
        asset.source.sha256,
        `Unsliced PNG chunks (including compressed IDAT pixels) must remain original: ${asset.url}`
      )
    }
    if (asset.css) {
      assert.ok(Number.isFinite(asset.appearance.whiteTextMinContrast))
      assert.ok(Array.isArray(asset.source.darkPrefabLayers))
      if (asset.appearance.requiresDarkSurface) {
        assert.ok(
          asset.appearance.whiteTextMinContrast >= 4.5,
          `Light content would be unreadable on ${asset.url}`
        )
        assert.ok(
          !manifest.surfaceAudit.excludedSources.some(
            (excluded) => excluded.guid === asset.source.guid
          ),
          `Excluded bright mask used as a dark content surface: ${asset.url}`
        )
      }
      assert.ok(css.includes(`--game-${asset.name}-image: url('${asset.url}')`))
      assert.ok(css.includes(`--game-${asset.name}-slice: ${asset.css.slice};`))
      assert.ok(css.includes(`--game-${asset.name}-width: ${asset.css.width};`))
    }
  }
  const primaryButton = manifest.assets.find(
    (asset) => asset.name === 'button-primary'
  )
  assert.equal(primaryButton.width, 96)
  assert.equal(primaryButton.height, 140)
  assert.deepEqual(primaryButton.normalization, {
    insertedColumns: 2,
    insertedRows: 2,
  })
  const popupCap = manifest.assets.find((asset) => asset.name === 'popup-cap')
  assert.equal(popupCap.source.guid, '4442cfe93a4854fcf903dc4237f44398')
  assert.equal(popupCap.width, 496)
  assert.equal(popupCap.height, 103)
  assert.deepEqual(popupCap.normalization, {
    insertedColumns: 0,
    insertedRows: 0,
  })
  assert.deepEqual(popupCap.css, { slice: '0 0 0 0', width: '0px 0px 0px 0px' })
  assert.equal(
    popupCap.pngProvenance.imagePayloadSha256,
    popupCap.source.sha256
  )
  const popupWindow = manifest.assets.find(
    (asset) => asset.name === 'popup-window'
  )
  assert.equal(popupWindow.source.guid, '9d9152997893243c59065e53ec0ccfea')
  assert.equal(popupWindow.width, 142)
  assert.equal(popupWindow.height, 142)
  assert.deepEqual(popupWindow.css, {
    slice: '70 70 70 70',
    width: '21px 21px 21px 21px',
  })
})
