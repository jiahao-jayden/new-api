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
/**
 * Build source-preserving browser paint adapters for neutral structural surfaces.
 *
 * bun scripts/build-unity-neutral.mjs [--check]
 *
 * Original PNGs, provenance and nine-slice CSS remain untouched. Each SVG embeds
 * the complete original PNG and limits its paint filter to that image. Semantic
 * fills, checked controls, icons and illustrations retain their original colors,
 * except the approved red danger fill receives RGB gain for white-label contrast.
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const frontendRoot = new URL('../', import.meta.url)
const outputRoot = new URL('public/assets/unity-ui/', frontendRoot)
const publicPrefix = '/assets/unity-ui/neutral'
const neutralSurfaces = [
  'panel',
  'panel-muted',
  'panel-gray',
  'list',
  'list-selected',
  'list-flat',
  'list-inset',
  'list-disabled',
  'table',
  'table-inner',
  'table-raised',
  'table-inset',
  'table-flat',
  'table-soft',
  'card-header',
  'card-footer',
  'card-frame',
  'popup',
  'popup-inner',
  'popup-raised',
  'popup-footer',
  'popup-title',
  'popup-window',
  'popup-cap',
  'input',
  'input-inner',
  'button-secondary',
  'button-disabled',
  'button-flat',
  'button-outline',
  'nav',
  'nav-selected',
  'nav-tile',
  'tab-menu',
  'progress-track',
  'progress-track-thin',
  'background',
]
const neutralControls = ['checkbox-off', 'radio-off', 'switch-off']
const semanticSurfaces = ['button-danger']

export function createNeutralAdapter(asset, bytes) {
  const expectedCategory = neutralControls.includes(asset.name)
    ? 'controls'
    : 'surfaces'
  if (
    ![...neutralSurfaces, ...neutralControls, ...semanticSurfaces].includes(
      asset.name
    ) ||
    asset.category !== expectedCategory ||
    asset.url !== `/assets/unity-ui/${expectedCategory}/${asset.name}.png`
  ) {
    throw new Error(
      `Asset is outside the approved paint adapters: ${asset.name}`
    )
  }
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  if (sha256 !== asset.sha256) {
    throw new Error(`Original source hash mismatch: ${asset.url}`)
  }
  if (
    bytes.length < 24 ||
    !bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
    bytes.readUInt32BE(16) !== asset.width ||
    bytes.readUInt32BE(20) !== asset.height
  ) {
    throw new Error(`Original source dimensions mismatch: ${asset.url}`)
  }

  // The selected navigation art is much brighter than the surrounding panels.
  // Halving only its RGB paint leaves its source bevel, texture and alpha intact.
  let gain = asset.name === 'nav-selected' ? 0.5 : 1
  const semanticDanger = asset.name === 'button-danger'
  if (semanticDanger) {
    // The brightest opaque source pixel is #ff706a. RGB gain 0.68 keeps white
    // labels above 4.9:1 even when the existing pressed filter dims both paints.
    gain = 0.68
  }
  const metadata = JSON.stringify({
    kind: 'source-preserving-runtime-paint-adapter',
    source: {
      url: asset.url,
      sha256,
      originalAssetSha256: asset.source.sha256,
      pathname: asset.source.pathname,
    },
    transformation: {
      kind: 'approved-runtime-paint',
      mode: semanticDanger ? 'semantic-danger-contrast' : 'neutral-structural',
      scope: 'embedded-image-only',
      colorSpace: 'sRGB',
      saturation: semanticDanger ? 1 : 0,
      luminanceGain: gain,
      alpha: 'unchanged',
    },
    geometry: {
      width: asset.width,
      height: asset.height,
      nineSlice: asset.css ?? null,
    },
    rights:
      'Original Layer Lab GUI Pro - Simple Casual artwork and author rights retained. User-provided licensed assets; no standalone redistribution grant.',
  })
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

  const filter = []
  if (!semanticDanger) {
    filter.push('      <feColorMatrix type="saturate" values="0" />')
  }
  if (gain !== 1) {
    filter.push(
      `      <feColorMatrix type="matrix" values="${gain} 0 0 0 0 0 ${gain} 0 0 0 0 0 ${gain} 0 0 0 0 0 1 0" />`
    )
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${asset.width}" height="${asset.height}" viewBox="0 0 ${asset.width} ${asset.height}">`,
    `  <metadata>${metadata}</metadata>`,
    '  <defs>',
    `    <filter id="neutral" x="0" y="0" width="${asset.width}" height="${asset.height}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">`,
    ...filter,
    '    </filter>',
    '  </defs>',
    `  <image width="${asset.width}" height="${asset.height}" preserveAspectRatio="none" href="data:image/png;base64,${bytes.toString('base64')}" filter="url(#neutral)" />`,
    '</svg>',
    '',
  ].join('\n')
}

export async function buildNeutralAdapters(options = {}) {
  const manifest = JSON.parse(
    await readFile(
      new URL('../../docs/unity-ui-assets.json', frontendRoot),
      'utf8'
    )
  )
  const outputs = new Map()
  const css = [
    '/* Generated by scripts/build-unity-neutral.mjs. Original Layer Lab PNGs and slice geometry are unchanged. */',
    'html:root:where(:not(:has([data-original-website]))) {',
  ]
  for (const name of [
    ...neutralSurfaces,
    ...neutralControls,
    ...semanticSurfaces,
  ]) {
    const asset = manifest.assets.find((item) => item.name === name)
    if (!asset) throw new Error(`Missing original neutral surface: ${name}`)
    const bytes = await readFile(new URL(`public${asset.url}`, frontendRoot))
    outputs.set(`neutral/${name}.svg`, createNeutralAdapter(asset, bytes))
    css.push(`  --game-${name}-image: url('${publicPrefix}/${name}.svg');`)
  }
  css.push('}', '')
  outputs.set('unity-neutral.css', css.join('\n'))
  if (!options.check) {
    await mkdir(new URL('neutral/', outputRoot), { recursive: true })
  }
  for (const [name, content] of outputs) {
    const destination = new URL(name, outputRoot)
    if (!options.check) {
      await writeFile(destination, content)
      continue
    }
    if ((await readFile(destination, 'utf8')) !== content) {
      throw new Error(`Neutral adapter is outdated: ${name}`)
    }
  }
  return outputs
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  if (process.argv.slice(2).some((argument) => argument !== '--check')) {
    throw new Error('Usage: build-unity-neutral.mjs [--check]')
  }
  const check = process.argv.includes('--check')
  const outputs = await buildNeutralAdapters({ check })
  console.log(
    `${check ? 'Verified' : 'Built'} ${outputs.size - 1} source-preserving paint adapters.`
  )
}
