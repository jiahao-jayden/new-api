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
 * Opt-in, purpose-specific paint for original Unity artwork.
 * No existing surface variable or page palette is replaced. Components must
 * explicitly choose a role; the embedded PNG, alpha and slice geometry survive.
 * bun scripts/build-unity-semantic.mjs [--check]
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const frontendRoot = new URL('../', import.meta.url)
const outputRoot = new URL('public/assets/unity-ui/', frontendRoot)

// Independently authored functional surfaces. Never assign these at route or
// document scope: the consuming component explicitly declares what it means.
const surfacePaints = {
  value: {
    low: '#ffe362',
    high: '#fff1a0',
    label: '#25314a',
    muted: '#414853',
  },
  success: {
    low: '#67e4b5',
    high: '#a5f4d9',
    label: '#173b3d',
    muted: '#285251',
  },
  reward: {
    low: '#c88ff8',
    high: '#e6bdff',
    label: '#34214d',
    muted: '#38234e',
  },
  info: { low: '#67d3f6', high: '#adeaff', label: '#173950', muted: '#234459' },
  danger: {
    low: '#ffb2c0',
    high: '#ffdae3',
    label: '#571b32',
    muted: '#73344a',
  },
}
const productPaints = {
  anthropic: { low: '#d58cf8', high: '#ebbdff', muted: '#1a2538' },
  openai: { low: '#b4ee42', high: '#d4ff8e', muted: '#3e5227' },
  google: { low: '#ffe34f', high: '#fff2a0', muted: '#4c4927' },
  deepseek: { low: '#45cbf4', high: '#93e8ff', muted: '#1a2538' },
  qwen: { low: '#b89cff', high: '#dbccff', muted: '#1a2538' },
  other: { low: '#51e3cc', high: '#a5f7e7', muted: '#1a2538' },
}

// These are dark-mode control paints, not claims to reproduce brand swatches.
// Blue/green retain payment identity; darkened fills support white labels.
export const semanticPaints = {
  utility: {
    source: 'button-secondary',
    low: '#334763',
    high: '#425a7b',
    label: '#f4f7ff',
  },
  alipay: {
    source: 'button-secondary',
    low: '#064783',
    high: '#0964be',
    label: '#ffffff',
  },
  wechat: {
    source: 'button-secondary',
    low: '#07552d',
    high: '#157a42',
    label: '#ffffff',
  },
  reward: {
    source: 'button-secondary',
    low: '#bb87f5',
    high: '#dfb3ff',
    label: '#34214d',
  },
  value: {
    source: 'button-secondary',
    low: '#ffe049',
    high: '#ffed91',
    label: '#25314a',
  },
  info: {
    source: 'button-secondary',
    low: '#3fcdf4',
    high: '#81e5ff',
    label: '#163c55',
  },
  amount: {
    source: 'button-secondary',
    low: '#51d8f4',
    high: '#99edff',
    label: '#173950',
  },
  success: {
    source: 'button-secondary',
    low: '#30dfa0',
    high: '#73f2bc',
    label: '#123d33',
  },
  'info-seat': {
    source: 'panel',
    low: '#22364c',
    high: '#334969',
    label: '#f4f7ff',
    muted: '#c6d7f2',
  },
  'requests-fill': { source: 'progress-fill', low: '#429aba', high: '#83d1e8' },
  'models-fill': { source: 'progress-fill', low: '#9470bd', high: '#ceb2ef' },
  ...Object.fromEntries(
    Object.entries(surfacePaints).flatMap(([role, paint]) => [
      [`panel-${role}`, { source: 'panel', ...paint }],
      [`popup-${role}`, { source: 'popup-window', ...paint }],
      [`cap-${role}`, { source: 'popup-cap', ...paint }],
      [`footer-${role}`, { source: 'popup-footer', ...paint }],
    ])
  ),
  ...Object.fromEntries(
    Object.entries(productPaints).map(([vendor, paint]) => [
      `product-${vendor}`,
      { source: 'card-frame', label: '#121d2e', ...paint },
    ])
  ),
  'input-value': {
    source: 'input',
    low: '#1c2a45',
    high: '#2c4061',
    label: '#f4f7ff',
    muted: '#cfdef2',
  },
  'input-reward': {
    source: 'input',
    low: '#271b34',
    high: '#412954',
    label: '#fff8f3',
    muted: '#e5d4f2',
  },
  'input-info': {
    source: 'input',
    low: '#102c32',
    high: '#1b4653',
    label: '#fff8f3',
    muted: '#cfe5ec',
  },
}

export function createSemanticAdapter(asset, bytes, role) {
  if (
    !Object.hasOwn(semanticPaints, role) ||
    asset.name !== semanticPaints[role].source ||
    asset.category !== 'surfaces' ||
    asset.url !== `/assets/unity-ui/surfaces/${semanticPaints[role].source}.png`
  ) {
    throw new Error(
      'Semantic paint requires its approved original source and a defined role'
    )
  }
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  if (sha256 !== asset.sha256) throw new Error('Original source hash mismatch')
  if (
    bytes.length < 24 ||
    !bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
    bytes.readUInt32BE(16) !== asset.width ||
    bytes.readUInt32BE(20) !== asset.height
  ) {
    throw new Error('Original source dimensions mismatch')
  }
  const paint = semanticPaints[role]
  const rgb = [paint.low, paint.high].map((hex) =>
    [1, 3, 5].map(
      (index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255
    )
  )
  const metadata = JSON.stringify({
    kind: 'source-preserving-runtime-paint-adapter',
    source: {
      url: asset.url,
      sha256,
      originalAssetSha256: asset.source.sha256,
      pathname: asset.source.pathname,
    },
    transformation: {
      role,
      mode: 'opt-in-semantic',
      scope: 'embedded-image-only',
      colorSpace: 'sRGB',
      low: paint.low,
      high: paint.high,
      alpha: 'unchanged',
    },
    geometry: {
      width: asset.width,
      height: asset.height,
      nineSlice: asset.css,
    },
    rights:
      'Original Layer Lab GUI Pro - Simple Casual artwork and author rights retained. User-provided licensed assets; no standalone redistribution grant.',
  })
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
  const channels = ['R', 'G', 'B'].map(
    (channel, index) =>
      `        <feFunc${channel} type="table" tableValues="${rgb[0][index]} ${rgb[1][index]}" />`
  )
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${asset.width}" height="${asset.height}" viewBox="0 0 ${asset.width} ${asset.height}">`,
    `  <metadata>${metadata}</metadata>`,
    '  <defs>',
    `    <filter id="paint" x="0" y="0" width="${asset.width}" height="${asset.height}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">`,
    '      <feColorMatrix type="saturate" values="0" />',
    '      <feComponentTransfer>',
    ...channels,
    '        <feFuncA type="identity" />',
    '      </feComponentTransfer>',
    '    </filter>',
    '  </defs>',
    `  <image width="${asset.width}" height="${asset.height}" preserveAspectRatio="none" href="data:image/png;base64,${bytes.toString('base64')}" filter="url(#paint)" />`,
    '</svg>',
    '',
  ].join('\n')
}

export async function buildSemanticAdapters(options = {}) {
  const manifest = JSON.parse(
    await readFile(
      new URL('../../docs/unity-ui-assets.json', frontendRoot),
      'utf8'
    )
  )
  const outputs = new Map()
  const css = [
    '/* Generated by scripts/build-unity-semantic.mjs. Opt-in role paints; never a page or global recolor. */',
    'html:root:where(:not(:has([data-original-website]))) {',
  ]
  for (const [role, paint] of Object.entries(semanticPaints)) {
    const asset = manifest.assets.find((item) => item.name === paint.source)
    if (!asset) throw new Error(`Missing original source: ${paint.source}`)
    const bytes = await readFile(new URL(`public${asset.url}`, frontendRoot))
    outputs.set(
      `semantic/${role}.svg`,
      createSemanticAdapter(asset, bytes, role)
    )
    css.push(
      `  --game-semantic-${role}-image: url('/assets/unity-ui/semantic/${role}.svg');`
    )
    if (paint.label) {
      css.push(`  --game-semantic-${role}-label: ${paint.label};`)
    }
    if (paint.muted) {
      css.push(`  --game-semantic-${role}-muted: ${paint.muted};`)
    }
  }
  css.push('}', '')
  outputs.set('unity-semantic.css', css.join('\n'))
  if (!options.check) {
    await mkdir(new URL('semantic/', outputRoot), { recursive: true })
  }
  for (const [name, content] of outputs) {
    const destination = new URL(name, outputRoot)
    if (!options.check) await writeFile(destination, content)
    else if ((await readFile(destination, 'utf8')) !== content) {
      throw new Error(`Semantic adapter is outdated: ${name}`)
    }
  }
  return outputs
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  if (process.argv.slice(2).some((argument) => argument !== '--check')) {
    throw new Error('Usage: build-unity-semantic.mjs [--check]')
  }
  const check = process.argv.includes('--check')
  const outputs = await buildSemanticAdapters({ check })
  console.log(
    `${check ? 'Verified' : 'Built'} ${outputs.size - 1} opt-in semantic paint adapters.`
  )
}
