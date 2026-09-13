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
 * Import a bounded set of the user-provided Layer Lab GUI Pro - Simple Casual assets.
 *
 * bun scripts/import-unity-ui.mjs --source /path/to/extracted-unitypackage \
 *   --package /path/to/source.unitypackage --sharp-module /path/to/node_modules/sharp
 *
 * The extracted source is the standard GUID/{pathname,asset,asset.meta} layout.
 * PNGs, fonts and static prefab metadata are read; Unity code is never executed.
 * Sharp is only an offline import dependency, never a browser dependency. Omit
 * --sharp-module when sharp is already resolvable in the local environment.
 */
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const frontendRoot = fileURLToPath(new URL('..', import.meta.url))
const repositoryRoot = path.resolve(frontendRoot, '../..')
const sourceRoot = 'Assets/Layer Lab/GUI Pro-SimpleCasual/ResourcesData'
const componentRoot = `${sourceRoot}/Sprites/Components`
const publicPrefix = '/assets/unity-ui'
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const originKeyword = 'impeccable:prompt'

export function readPngChunks(bytes) {
  if (!bytes.subarray(0, 8).equals(pngSignature)) {
    throw new Error('Invalid PNG signature')
  }
  const chunks = []
  for (let offset = 8; offset < bytes.length; ) {
    if (offset + 12 > bytes.length) throw new Error('Truncated PNG chunk')
    const length = bytes.readUInt32BE(offset)
    const end = offset + length + 12
    if (end > bytes.length) throw new Error('Truncated PNG chunk data')
    const type = bytes.toString('ascii', offset + 4, offset + 8)
    chunks.push({
      type,
      data: bytes.subarray(offset + 8, end - 4),
      bytes: bytes.subarray(offset, end),
    })
    offset = end
    if (type === 'IEND') {
      // Some licensed originals have producer data after IEND. Keep it opaque.
      if (end < bytes.length) {
        chunks.push({
          type: 'trailing-data',
          data: bytes.subarray(end),
          bytes: bytes.subarray(end),
        })
      }
      break
    }
  }
  if (
    chunks[0]?.type !== 'IHDR' ||
    !chunks.some((chunk) => chunk.type === 'IEND')
  ) {
    throw new Error('PNG must contain IHDR and end with IEND')
  }
  return chunks
}

/** Add origin text without decoding, recompressing or altering any image chunk. */
export function embedPngOrigin(bytes, origin) {
  if (!origin || /[^\x20-\x7e]/.test(origin)) {
    throw new Error('PNG origin must be nonempty printable ASCII')
  }
  const chunks = readPngChunks(bytes)
  const data = Buffer.from(`${originKeyword}\0${origin}`, 'ascii')
  const chunk = Buffer.alloc(data.length + 12)
  chunk.writeUInt32BE(data.length)
  chunk.write('tEXt', 4, 'ascii')
  data.copy(chunk, 8)
  let crc = 0xffffffff
  for (const byte of chunk.subarray(4, -4)) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  chunk.writeUInt32BE((crc ^ 0xffffffff) >>> 0, chunk.length - 4)
  const retained = chunks.filter(
    (item) =>
      !(
        item.type === 'tEXt' &&
        item.data
          .subarray(0, originKeyword.length + 1)
          .equals(Buffer.from(`${originKeyword}\0`))
      )
  )
  const endIndex = retained.findIndex((item) => item.type === 'IEND')
  return Buffer.concat([
    pngSignature,
    ...retained.slice(0, endIndex).map((item) => item.bytes),
    chunk,
    ...retained.slice(endIndex).map((item) => item.bytes),
  ])
}

// Name, original component path, displayed border scale. A sprite's slice always
// remains in original source pixels; only its displayed border widths are scaled.
export const surfaceSelection = [
  ['panel', 'Frame/Frame_Demo_Dark/BasicFrame_Rectangle01_l.png', 0.3],
  [
    'panel-muted',
    'Frame/Frame_Demo_Dark/BasicFrame_Rectangle02_s_Navy.png',
    0.3,
  ],
  ['panel-gray', 'Frame/Frame_Demo_Dark/ListFrame01_n.png', 0.3],
  ['list', 'Frame/Frame_Demo_Dark/ListFrame01_n.png', 0.3],
  ['list-selected', 'Frame/Frame_Demo_Dark/ListFrame01_s.png', 0.3],
  ['list-flat', 'Frame/Frame_Demo_Dark/ListFrame00.png', 0.3],
  ['list-inset', 'Frame/Frame_Demo_Dark/ListFrame02_n.png', 0.3],
  ['list-disabled', 'Frame/Frame_Demo_Dark/ListFrame02_d.png', 0.3],
  ['table', 'Frame/Frame_Demo_Dark/TableFrame01_1.png', 0.3],
  // TableFrame01_2 is a white image mask, not a painted dark surface.
  ['table-inner', 'Frame/Frame_Demo_Dark/TableFrame03_2.png', 0.3],
  ['table-raised', 'Frame/Frame_Demo_Dark/TableFrame03_1.png', 0.25],
  ['table-inset', 'Frame/Frame_Demo_Dark/TableFrame03_2.png', 0.3],
  ['table-flat', 'Frame/Frame_Demo_Dark/TableFrame04_1.png', 0.3],
  ['table-soft', 'Frame/Frame_Demo_Dark/TableFrame05.png', 0.25],
  ['card-header', 'Frame/Frame_Demo_Dark/CardFrame01_Frame1.png', 0.3],
  ['card-footer', 'Frame/Frame_Demo_Dark/CardFrame01_Frame2.png', 0.3],
  ['card-frame', 'Frame/Frame_Demo_Dark/CardFrame02,03_Frame.png', 0.3],
  // Native demo product backdrops retain their original diagonal highlight.
  // They have no sliced edges; clip them inside the separately framed card.
  [
    'product-back-blue',
    'Frame/Frame_Demo_Dark/CardFrame02,03_BackFrame_n_Blue.png',
    1,
  ],
  [
    'product-back-green',
    'Frame/Frame_Demo_Dark/CardFrame02,03_BackFrame_n_Green.png',
    1,
  ],
  [
    'product-back-yellow',
    'Frame/Frame_Demo_Dark/CardFrame02,03_BackFrame_n_Yellow.png',
    1,
  ],
  [
    'product-back-purple',
    'Frame/Frame_Demo_Dark/CardFrame02,03_BackFrame_n_Purple.png',
    1,
  ],
  ['card-focus', 'Frame/Frame_Demo_Dark/CardFrame02,03_Focus.png', 0.3],
  ['popup', 'Popup/Popup_Demo_Dark/Popup00_Frame1.png', 0.3],
  ['popup-inner', 'Popup/Popup_Demo_Dark/Popup00_Frame2.png', 0.3],
  ['popup-raised', 'Popup/Popup_Demo_Dark/Popup01_Frame1.png', 0.3],
  ['popup-footer', 'Popup/Popup_Demo_Dark/Popup01_Frame4.png', 0.3],
  ['popup-title', 'Popup/Popup_Demo_Dark/Popup01_Frame3_navy.png', 0.3],
  ['popup-window', 'Popup/Popup_Demo_Dark/Popup02_Frame1.png', 0.3],
  // This decorative cap is an unsliced 496:103 image, matching the demo prefab.
  ['popup-cap', 'Popup/Popup_Demo_Dark/Popup02_Frame2.png', 1],
  ['input', 'Frame/Frame_Demo_Dark/BasicFrame_Rectangle02_s_Navy.png', 0.24],
  [
    'input-inner',
    'Frame/Frame_Demo_Dark/BasicFrame_Rectangle02_s_Navy.png',
    0.24,
  ],
  [
    'button-primary',
    'Button/Button_Demo_Common/Btn_Rectangle00_n_Blue.png',
    0.25,
  ],
  [
    'button-secondary',
    'Button/Button_Demo_Common/Btn_Rectangle00_n_Navy.png',
    0.25,
  ],
  [
    'button-success',
    'Button/Button_Demo_Common/Btn_Rectangle00_n_Green.png',
    0.25,
  ],
  [
    'button-warning',
    'Button/Button_Demo_Common/Btn_Rectangle00_n_Orange.png',
    0.25,
  ],
  [
    'button-danger',
    'Button/Button_Demo_Common/Btn_Rectangle00_n_Red.png',
    0.25,
  ],
  ['button-disabled', 'Button/Button_Demo_Dark/Btn_Rectangle00_d.png', 0.25],
  ['button-flat', 'Button/Button_Demo_Dark/Btn_Rectangle04_Navy.png', 0.25],
  [
    'button-outline',
    'Button/Button_Demo_Dark/Btn_Rectangle04_Transpar.png',
    0.25,
  ],
  ['nav', 'Button/Button_Demo_Dark/Btn_MenuButton_Rectangle00_n.png', 0.3],
  [
    'nav-selected',
    'Button/Button_Demo_Dark/Btn_MenuButton_Rectangle00_s.png',
    0.3,
  ],
  ['nav-tile', 'Button/Button_Demo_Dark/Btn_MenuButton_Rectangle01.png', 0.25],
  ['tab-menu', 'Frame/Frame_Demo_Dark/TabMenuFrame.png', 0.3],
  ['progress-track', 'Slider/Slider_Demo_Dark/Slider15_Frame.png', 0.2],
  ['progress-fill', 'Slider/Slider_Demo_Dark/Slider15_Fill.png', 0.2],
  ['progress-track-thin', 'Slider/Slider_Demo_Dark/Slider01_Frame.png', 0.2],
  ['progress-fill-thin', 'Slider/Slider_Demo_Dark/Slider01_Fill.png', 0.2],
]

const controlSelection = [
  ['checkbox-off', 'Toggle_Check_Frame_Off_Dark.png'],
  ['checkbox-on', 'Toggle_Check_On.png'],
  ['radio-off', 'Toggle_Radio_Off_Dark.png'],
  ['radio-on', 'Toggle_Radio_On.png'],
  ['switch-off', 'Toggle_Switch_Frame_Off_Dark.png'],
  ['switch-on', 'Toggle_Switch_Frame_On.png'],
  ['switch-handle', 'Toggle_Switch_Handle.png'],
  ['notification', 'Notify_Point_Red.png'],
]

const itemSelection = [
  'Home',
  'Home_Shop_0',
  'Home_Shop_1',
  'Document',
  'Gear',
  'Setting',
  'Coin_Gold_Dollar',
  'Key_Gold',
  'Key_Silver',
  'Chat',
  'Chat_Talk',
  'Scroll_1_Stats',
  'Rocket',
  'Leaderboard',
  'Lock',
  'Globe',
  'Book_Blue',
  'Bulb',
  'Card',
  'Calendar',
  'Gift_Blue',
  'Trophy_Gold',
  'Friends',
  'Search',
  'Send_Blue',
  'Pencil',
  'Mail',
  'Bell',
  'Money',
  'Piggy',
  'Box',
  'Target_Blue',
]

const fontSelection = [
  ['rubik-medium', 'Rubik-Medium.ttf', 'Unity Rubik', 500],
  ['rubik-semibold', 'Rubik-SemiBold.ttf', 'Unity Rubik', 600],
  ['quicksand-bold', 'Quicksand-Bold.ttf', 'Unity Quicksand', 700],
]

export function parseSpriteMetadata(text) {
  const guid = text.match(/^guid: ([a-f0-9]{32})$/m)?.[1]
  const border = text.match(
    /spriteBorder: \{x: ([\d.]+), y: ([\d.]+), z: ([\d.]+), w: ([\d.]+)\}/
  )
  if (!guid || !border) {
    throw new Error('Sprite metadata must include a GUID and border.')
  }
  const pivot = text.match(/spritePivot: \{x: ([\d.]+), y: ([\d.]+)\}/)
  return {
    guid,
    spriteID: text.match(/spriteID: ([a-f0-9]+)/)?.[1] ?? null,
    border: {
      left: Number(border[1]),
      bottom: Number(border[2]),
      right: Number(border[3]),
      top: Number(border[4]),
    },
    pivot: pivot ? { x: Number(pivot[1]), y: Number(pivot[2]) } : null,
    pixelsPerUnit: Number(
      text.match(/spritePixelsToUnits: ([\d.]+)/)?.[1] ?? 100
    ),
    filterMode: Number(text.match(/filterMode: (\d+)/)?.[1] ?? 1),
  }
}

/**
 * Unity can stretch a zero-width center by bilinearly sampling its shared UV
 * boundary. CSS border-image suppresses that center altogether. Insert two
 * identical RGBA samples at that boundary, leaving every original pixel intact.
 * PNG rows run top-to-bottom; Unity's y border is bottom and w border is top.
 */
export function normalizeNineSlice(sprite, border) {
  const { width, height, data } = sprite
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    data.length !== width * height * 4
  ) {
    throw new Error(
      'Expected nonempty RGBA pixels and integer sprite dimensions.'
    )
  }
  if (
    Object.values(border).some(
      (value) => !Number.isInteger(value) || value < 0
    ) ||
    border.left + border.right > width ||
    border.top + border.bottom > height
  ) {
    throw new Error(
      'Sprite borders must be nonnegative integers within the image.'
    )
  }
  const insertedColumns = border.left + border.right === width ? 2 : 0
  const insertedRows = border.top + border.bottom === height ? 2 : 0
  if (!insertedColumns && !insertedRows) {
    return { ...sprite, insertedColumns, insertedRows }
  }
  const normalizedWidth = width + insertedColumns
  const normalizedHeight = height + insertedRows
  const normalized = Buffer.alloc(normalizedWidth * normalizedHeight * 4)

  for (let y = 0; y < normalizedHeight; y++) {
    let sourceY = y
    if (insertedRows && y >= border.top) {
      sourceY =
        y < border.top + insertedRows ? border.top - 0.5 : y - insertedRows
    }
    const y0 = Math.max(0, Math.min(height - 1, Math.floor(sourceY)))
    const y1 = Math.max(0, Math.min(height - 1, Math.ceil(sourceY)))
    const ty = sourceY - Math.floor(sourceY)
    for (let x = 0; x < normalizedWidth; x++) {
      let sourceX = x
      if (insertedColumns && x >= border.left) {
        sourceX =
          x < border.left + insertedColumns
            ? border.left - 0.5
            : x - insertedColumns
      }
      const x0 = Math.max(0, Math.min(width - 1, Math.floor(sourceX)))
      const x1 = Math.max(0, Math.min(width - 1, Math.ceil(sourceX)))
      const tx = sourceX - Math.floor(sourceX)
      for (let channel = 0; channel < 4; channel++) {
        const top =
          data[(y0 * width + x0) * 4 + channel] * (1 - tx) +
          data[(y0 * width + x1) * 4 + channel] * tx
        const bottom =
          data[(y1 * width + x0) * 4 + channel] * (1 - tx) +
          data[(y1 * width + x1) * 4 + channel] * tx
        normalized[(y * normalizedWidth + x) * 4 + channel] = Math.round(
          top * (1 - ty) + bottom * ty
        )
      }
    }
  }
  return {
    data: normalized,
    width: normalizedWidth,
    height: normalizedHeight,
    insertedColumns,
    insertedRows,
  }
}

export function spriteCss(asset) {
  const border = asset.source.sprite.border
  const sides = [border.top, border.right, border.bottom, border.left]
  const slice = sides.join(' ')
  const width = sides
    .map((value) => `${Number((value * asset.borderScale).toFixed(2))}px`)
    .join(' ')
  return { slice, width }
}

export function measureSpriteCenter(sprite, border) {
  let maxLuminance = 0
  for (let y = border.top; y < sprite.height - border.bottom; y++) {
    for (let x = border.left; x < sprite.width - border.right; x++) {
      const index = (y * sprite.width + x) * 4
      const alpha = sprite.data[index + 3] / 255
      let luminance = 0
      for (let channel = 0; channel < 3; channel++) {
        const value =
          (sprite.data[index + channel] * alpha +
            [23, 35, 51][channel] * (1 - alpha)) /
          255
        const linear =
          value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        luminance += linear * [0.2126, 0.7152, 0.0722][channel]
      }
      maxLuminance = Math.max(maxLuminance, luminance)
    }
  }
  return { maxLuminance, whiteTextMinContrast: 1.05 / (maxLuminance + 0.05) }
}

async function importAssets(options) {
  const require = createRequire(import.meta.url)
  const sharp = require(options['sharp-module'] ?? 'sharp')
  const output = path.join(frontendRoot, 'public/assets/unity-ui')
  const source = path.resolve(options.source)
  const catalog = new Map()
  const darkPrefabLayers = new Map()
  for (const guid of (await readdir(source)).sort()) {
    if (!/^[a-f0-9]{32}$/.test(guid)) continue
    const pathname = (
      await readFile(path.join(source, guid, 'pathname'), 'utf8')
    )
      .split('\n')[0]
      .trim()
    if (pathname.endsWith('.prefab') && pathname.includes('Dark')) {
      const prefab = await readFile(path.join(source, guid, 'asset'), 'utf8')
      const blocks = prefab.split(/^--- /m)
      const names = new Map()
      const masks = new Map()
      for (const block of blocks) {
        if (block.startsWith('!u!1 ')) {
          names.set(
            block.match(/&(\d+)/)?.[1],
            block.match(/m_Name: (.+)/)?.[1]
          )
        }
        if (block.includes('m_ShowMaskGraphic:')) {
          masks.set(
            block.match(/m_GameObject: \{fileID: (\d+)/)?.[1],
            Number(block.match(/m_ShowMaskGraphic: (\d)/)?.[1])
          )
        }
      }
      for (const block of blocks) {
        const spriteGUID = block.match(
          /m_Sprite: \{fileID: \d+, guid: ([a-f0-9]+)/
        )?.[1]
        const color = block.match(
          /m_Color: \{r: ([\d.Ee+-]+), g: ([\d.Ee+-]+), b: ([\d.Ee+-]+), a: ([\d.Ee+-]+)\}/
        )
        if (!spriteGUID || !color) continue
        const gameObjectID = block.match(/m_GameObject: \{fileID: (\d+)/)?.[1]
        const layers = darkPrefabLayers.get(spriteGUID) ?? []
        layers.push({
          pathname,
          guid,
          componentID: block.match(/!u!114 &(\d+)/)?.[1],
          gameObjectName: names.get(gameObjectID),
          color: color.slice(1).map(Number),
          isMask: masks.has(gameObjectID),
          showMaskGraphic: masks.get(gameObjectID) ?? null,
        })
        darkPrefabLayers.set(spriteGUID, layers)
      }
    }
    if (!pathname.startsWith(`${sourceRoot}/`)) continue
    if (catalog.has(pathname)) {
      throw new Error(`Duplicate source pathname: ${pathname}`)
    }
    catalog.set(pathname, { guid, directory: path.join(source, guid) })
  }
  const selected = surfaceSelection.map(([name, filename, borderScale]) => ({
    name,
    category: 'surfaces',
    pathname: `${componentRoot}/${filename}`,
    borderScale,
  }))
  for (const [name, filename] of controlSelection) {
    selected.push({
      name,
      category: 'controls',
      pathname: `${componentRoot}/UI_Etc/${filename}`,
    })
  }
  for (const suffix of itemSelection) {
    selected.push({
      name: suffix.toLowerCase().replaceAll('_', '-'),
      category: 'items',
      pathname: `${componentRoot}/Icon_ItemIcons/128/Itemicon_${suffix}.Png`,
    })
  }
  for (const pathname of [...catalog.keys()].sort()) {
    if (
      !pathname.startsWith(`${componentRoot}/Icon_PictoIcons/64/`) ||
      !/\.png$/i.test(pathname)
    ) {
      continue
    }
    const name = path
      .basename(pathname)
      .replace(/^PictoIcon_/, '')
      .replace(/\.png$/i, '')
      .toLowerCase()
      .replaceAll('_', '-')
    selected.push({ name, category: 'picto', pathname })
  }
  selected.push({
    name: 'background',
    category: 'surfaces',
    pathname: `${sourceRoot}/Sprites/Demo/Demo_Background/Background_Gradatient02_Dark.png`,
    borderScale: 1,
  })
  for (const [name, filename, family, weight] of fontSelection) {
    selected.push({
      name,
      category: 'fonts',
      pathname: `${sourceRoot}/Fonts/${filename}`,
      family,
      weight,
    })
  }

  const assets = []
  const destinations = new Set()
  for (const selection of selected) {
    const entry = catalog.get(selection.pathname)
    if (!entry) throw new Error(`Missing selected asset: ${selection.pathname}`)
    const bytes = await readFile(path.join(entry.directory, 'asset'))
    const metadata = await readFile(
      path.join(entry.directory, 'asset.meta'),
      'utf8'
    )
    const extension = selection.category === 'fonts' ? '.ttf' : '.png'
    const relativeFile = `${selection.category}/${selection.name}${extension}`
    if (destinations.has(relativeFile)) {
      throw new Error(`Duplicate asset name: ${relativeFile}`)
    }
    destinations.add(relativeFile)
    const asset = {
      name: selection.name,
      category: selection.category,
      url: `${publicPrefix}/${relativeFile}`,
      source: {
        pathname: selection.pathname,
        guid: entry.guid,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        metadataSha256: createHash('sha256').update(metadata).digest('hex'),
      },
    }
    let outputBytes = bytes
    if (selection.category === 'fonts') {
      asset.family = selection.family
      asset.weight = selection.weight
    } else {
      const sprite = parseSpriteMetadata(metadata)
      if (sprite.guid !== entry.guid) {
        throw new Error(`Metadata GUID mismatch: ${selection.pathname}`)
      }
      const decoded = await sharp(bytes)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
      asset.source.sprite = sprite
      asset.source.width = decoded.info.width
      asset.source.height = decoded.info.height
      const normalized = normalizeNineSlice(
        {
          width: decoded.info.width,
          height: decoded.info.height,
          data: decoded.data,
        },
        sprite.border
      )
      asset.width = normalized.width
      asset.height = normalized.height
      asset.normalization = {
        insertedColumns: normalized.insertedColumns,
        insertedRows: normalized.insertedRows,
      }
      if (normalized.insertedColumns || normalized.insertedRows) {
        outputBytes = await sharp(normalized.data, {
          raw: {
            width: normalized.width,
            height: normalized.height,
            channels: 4,
          },
        })
          .png({ compressionLevel: 9 })
          .toBuffer()
      }
      if (selection.borderScale !== undefined) {
        asset.borderScale = selection.borderScale
        asset.css = spriteCss(asset)
        asset.appearance = measureSpriteCenter(normalized, sprite.border)
        asset.appearance.requiresDarkSurface =
          /^(panel|list|table|popup|input)/.test(selection.name)
        asset.source.darkPrefabLayers = darkPrefabLayers.get(entry.guid) ?? []
        if (
          asset.appearance.requiresDarkSurface &&
          asset.appearance.whiteTextMinContrast < 4.5
        ) {
          throw new Error(
            `A light or mask-only source cannot paint a dark content panel: ${selection.name}`
          )
        }
      }
      const origin = JSON.stringify({
        kind: 'sourced-original-artwork',
        author: 'Layer Lab',
        pack: 'GUI Pro - Simple Casual',
        package: path.basename(
          options.package ?? 'GUI Pro - Simple CasualPSD 1.0.7.unitypackage'
        ),
        pathname: asset.source.pathname,
        guid: asset.source.guid,
        sourceSha256: asset.source.sha256,
        normalization: asset.normalization,
        rights:
          'User-provided licensed package; original author rights retained. No standalone redistribution grant.',
      }).replaceAll(
        /[^\x20-\x7e]/g,
        (character) =>
          `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`
      )
      asset.pngProvenance = {
        keyword: originKeyword,
        origin,
        imagePayloadSha256: createHash('sha256')
          .update(outputBytes)
          .digest('hex'),
      }
      outputBytes = embedPngOrigin(outputBytes, origin)
    }
    asset.bytes = outputBytes.length
    asset.sha256 = createHash('sha256').update(outputBytes).digest('hex')
    await mkdir(path.join(output, selection.category), { recursive: true })
    await writeFile(path.join(output, relativeFile), outputBytes)
    assets.push(asset)
  }

  const sourcePackage = {
    filename: path.basename(
      options.package ?? 'GUI Pro - Simple CasualPSD 1.0.7.unitypackage'
    ),
  }
  if (options.package) {
    const hash = createHash('sha256')
    for await (const chunk of createReadStream(options.package)) {
      hash.update(chunk)
    }
    sourcePackage.sha256 = hash.digest('hex')
  }
  const manifest = {
    schemaVersion: 2,
    pack: 'GUI Pro - Simple Casual',
    author: 'Layer Lab',
    sourcePackage,
    license:
      'User-provided commercial Unity asset package. Original asset and font rights remain with their respective authors. This application-specific import is not a grant to redistribute the pack or its source files. The original package, PSDs, Unity scenes and scripts are excluded.',
    conversion:
      'Every PNG receives a deterministic impeccable:prompt tEXt chunk describing its source origin. Metadata insertion preserves all other PNG chunks, including the exact compressed image payload. Original artwork is unchanged unless a Unity nine-slice center has zero width or height; those sprites receive two identical pixels at the shared UV boundary, bilinearly sampled in RGBA. Original edge and corner pixels, borders, GUIDs and source hashes are preserved. imagePayloadSha256 identifies the complete PNG before origin metadata insertion. CSS slices use top/right/bottom/left; Unity metadata uses left/bottom/right/top. Fonts are copied byte-for-byte.',
    surfaceAudit: {
      scope:
        'All imported surfaces. Direct Image layers in Dark prefabs are recorded per source sprite with original RGBA and mask role. No tint is invented or baked. Bright control fills retain their source colors and require dark foreground text; card-focus is a transparent decorative overlay.',
      excludedSources: [
        {
          guid: 'b94ad4425888548039a8c69d289a39d6',
          reason:
            'TableFrame01_2_(Mask) is an all-white image mask covered by a child demo image in TableFrame01_Dark, not a dark painted panel.',
          layers:
            darkPrefabLayers.get('b94ad4425888548039a8c69d289a39d6') ?? [],
        },
        {
          guid: 'a54a00aa58b9b455c895e9312d25164d',
          reason:
            'BasicFrame_Rectangle02_s_Gray is a bright gray original variant, unsuitable behind the dark theme light foreground; the original Navy variant is used instead.',
          layers:
            darkPrefabLayers.get('a54a00aa58b9b455c895e9312d25164d') ?? [],
        },
      ],
    },
    assets,
  }
  await writeFile(
    path.join(repositoryRoot, 'docs/unity-ui-assets.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  )

  const css = [
    '/* Generated by scripts/import-unity-ui.mjs from user-provided Layer Lab assets. */',
  ]
  for (const asset of assets.filter((item) => item.category === 'fonts')) {
    css.push(
      `@font-face {\n  font-family: '${asset.family}';\n  src: url('${asset.url}') format('truetype');\n  font-weight: ${asset.weight};\n  font-style: normal;\n  font-display: swap;\n}`
    )
  }
  css.push(':root {')
  for (const asset of assets.filter((item) => item.css)) {
    css.push(
      `  --game-${asset.name}-image: url('${asset.url}');\n  --game-${asset.name}-slice: ${asset.css.slice};\n  --game-${asset.name}-width: ${asset.css.width};`
    )
  }
  for (const asset of assets.filter((item) => item.category === 'controls')) {
    css.push(`  --game-${asset.name}-image: url('${asset.url}');`)
  }
  css.push('}')
  for (const asset of assets.filter((item) => item.css)) {
    css.push(
      `.game-surface-${asset.name} {\n  --game-surface-image: var(--game-${asset.name}-image);\n  --game-surface-slice: var(--game-${asset.name}-slice);\n  --game-surface-width: var(--game-${asset.name}-width);\n}`
    )
  }
  await writeFile(path.join(output, 'unity-ui.css'), `${css.join('\n\n')}\n`)
  console.log(
    `Imported ${assets.length} assets (${assets.reduce((sum, item) => sum + item.bytes, 0)} bytes). Normalized ${assets.filter((item) => item.normalization?.insertedColumns || item.normalization?.insertedRows).length} sprites.`
  )
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  const options = {}
  for (let index = 2; index < process.argv.length; index += 2) {
    const flag = process.argv[index]
    const value = process.argv[index + 1]
    if (
      !['--source', '--package', '--sharp-module'].includes(flag) ||
      !value ||
      value.startsWith('--')
    ) {
      throw new Error(
        'Usage: import-unity-ui.mjs --source EXTRACTED_DIRECTORY [--package ORIGINAL_PACKAGE] [--sharp-module MODULE_PATH]'
      )
    }
    options[flag.slice(2)] = value
  }
  if (!options.source) {
    throw new Error('An extracted --source directory is required.')
  }
  await importAssets(options)
}
