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
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  Blend,
  Contrast,
  Hct,
  SchemeFidelity,
  SchemeMonochrome,
  SchemeTonalSpot,
  argbFromHex,
  hexFromArgb,
  xyzFromArgb,
} from '@material/material-color-utilities'

const OUTPUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/styles/material-colors.generated.css'
)
const CHECK_MODE = process.argv.includes('--check')

const WORKSPACES = [
  {
    key: 'home',
    route: 'home',
    seed: '#78787f',
    scheme: SchemeMonochrome,
    forceDark: true,
  },
  { key: 'platform', route: 'platform', seed: '#0b57d0' },
  { key: 'rankings', route: 'rankings', seed: '#a35c00' },
  { key: 'docs', route: 'docs', seed: '#24784a' },
  { key: 'about', route: 'about', seed: '#8e4958' },
  { key: 'chat', route: 'chat', seed: '#008577' },
  { key: 'general', route: 'general', seed: '#52677d' },
  { key: 'keys', route: 'keys', seed: '#6750a4' },
  { key: 'usage-common', route: 'usage-common', seed: '#00658f' },
  { key: 'usage-task', route: 'usage-task', seed: '#9c4146' },
  { key: 'personal', route: 'personal', seed: '#f9ab00' },
  { key: 'profile', route: 'profile', seed: '#7d5260' },
  { key: 'admin', route: 'admin', seed: '#d93025' },
  {
    key: 'system',
    route: 'system-administration',
    seed: '#188038',
  },
]

const PRESETS = [
  { key: 'underground', seed: '#4f715f', scheme: SchemeTonalSpot },
  { key: 'rose-garden', seed: '#cc2e62', scheme: SchemeTonalSpot },
  { key: 'lake-view', seed: '#00a884', scheme: SchemeTonalSpot },
  { key: 'sunset-glow', seed: '#b74736', scheme: SchemeTonalSpot },
  { key: 'forest-whisper', seed: '#007c70', scheme: SchemeTonalSpot },
  { key: 'ocean-breeze', seed: '#3367d6', scheme: SchemeTonalSpot },
  { key: 'lavender-dream', seed: '#7e57c2', scheme: SchemeTonalSpot },
  { key: 'simple-large', seed: '#5f6368', scheme: SchemeMonochrome },
  { key: 'anthropic', seed: '#d97757', scheme: SchemeFidelity },
]

const STATUS_SEEDS = {
  info: '#0b57d0',
  success: '#188038',
  violet: '#7e57c2',
  warning: '#f9ab00',
}

const MATERIAL_ROLES = [
  ['background', 'background'],
  ['on-background', 'onBackground'],
  ['surface', 'surface'],
  ['surface-dim', 'surfaceDim'],
  ['surface-bright', 'surfaceBright'],
  ['surface-container-lowest', 'surfaceContainerLowest'],
  ['surface-container-low', 'surfaceContainerLow'],
  ['surface-container', 'surfaceContainer'],
  ['surface-container-high', 'surfaceContainerHigh'],
  ['surface-container-highest', 'surfaceContainerHighest'],
  ['on-surface', 'onSurface'],
  ['surface-variant', 'surfaceVariant'],
  ['on-surface-variant', 'onSurfaceVariant'],
  ['inverse-surface', 'inverseSurface'],
  ['inverse-on-surface', 'inverseOnSurface'],
  ['outline', 'outline'],
  ['outline-variant', 'outlineVariant'],
  ['shadow', 'shadow'],
  ['scrim', 'scrim'],
  ['surface-tint', 'surfaceTint'],
  ['primary', 'primary'],
  ['on-primary', 'onPrimary'],
  ['primary-container', 'primaryContainer'],
  ['on-primary-container', 'onPrimaryContainer'],
  ['inverse-primary', 'inversePrimary'],
  ['primary-fixed', 'primaryFixed'],
  ['primary-fixed-dim', 'primaryFixedDim'],
  ['on-primary-fixed', 'onPrimaryFixed'],
  ['on-primary-fixed-variant', 'onPrimaryFixedVariant'],
  ['secondary', 'secondary'],
  ['on-secondary', 'onSecondary'],
  ['secondary-container', 'secondaryContainer'],
  ['on-secondary-container', 'onSecondaryContainer'],
  ['secondary-fixed', 'secondaryFixed'],
  ['secondary-fixed-dim', 'secondaryFixedDim'],
  ['on-secondary-fixed', 'onSecondaryFixed'],
  ['on-secondary-fixed-variant', 'onSecondaryFixedVariant'],
  ['tertiary', 'tertiary'],
  ['on-tertiary', 'onTertiary'],
  ['tertiary-container', 'tertiaryContainer'],
  ['on-tertiary-container', 'onTertiaryContainer'],
  ['tertiary-fixed', 'tertiaryFixed'],
  ['tertiary-fixed-dim', 'tertiaryFixedDim'],
  ['on-tertiary-fixed', 'onTertiaryFixed'],
  ['on-tertiary-fixed-variant', 'onTertiaryFixedVariant'],
  ['error', 'error'],
  ['on-error', 'onError'],
  ['error-container', 'errorContainer'],
  ['on-error-container', 'onErrorContainer'],
]

const CONTRAST_PAIRS = [
  ['primary', 'onPrimary'],
  ['primaryContainer', 'onPrimaryContainer'],
  ['secondary', 'onSecondary'],
  ['secondaryContainer', 'onSecondaryContainer'],
  ['tertiary', 'onTertiary'],
  ['tertiaryContainer', 'onTertiaryContainer'],
  ['error', 'onError'],
  ['errorContainer', 'onErrorContainer'],
  ['surface', 'onSurface'],
  ['surface', 'onSurfaceVariant'],
  ['inverseSurface', 'inverseOnSurface'],
]

function createScheme(seed, isDark, SchemeClass = SchemeTonalSpot) {
  return new SchemeClass(
    Hct.fromInt(argbFromHex(seed)),
    isDark,
    0,
    '2021',
    'phone'
  )
}

function contrastRatio(first, second) {
  return Contrast.ratioOfYs(xyzFromArgb(first)[1], xyzFromArgb(second)[1])
}

function validateScheme(name, scheme) {
  for (const [background, foreground] of CONTRAST_PAIRS) {
    const ratio = contrastRatio(scheme[background], scheme[foreground])
    if (ratio < 4.5) {
      throw new Error(
        `${name}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1`
      )
    }
  }
}

function renderSchemeVariables(scheme, prefix = '') {
  return MATERIAL_ROLES.map(
    ([cssName, property]) =>
      `  --${prefix}${cssName}: ${hexFromArgb(scheme[property])};`
  ).join('\n')
}

function renderSchemeAliases(sourcePrefix = '') {
  return MATERIAL_ROLES.map(
    ([cssName]) => `  --${cssName}: var(--${sourcePrefix}${cssName});`
  ).join('\n')
}

function renderAliasVariable(name, target) {
  const declaration = `  --${name}: var(--${target});`
  if (declaration.length <= 80) return declaration

  return `  --${name}: var(
    --${target}
  );`
}

function renderComponentAliases() {
  return `  --background: var(--surface-container-lowest);
  --foreground: var(--on-surface);
  --card: var(--surface);
  --card-foreground: var(--on-surface);
  --popover: var(--surface-container-low);
  --popover-foreground: var(--on-surface);
  --primary-foreground: var(--on-primary);
  --secondary-foreground: var(--on-secondary);
  --tertiary-foreground: var(--on-tertiary);
  --muted: var(--surface-container);
  --muted-foreground: var(--on-surface-variant);
  --accent: var(--primary-container);
  --accent-foreground: var(--on-primary-container);
  --destructive: var(--error);
  --destructive-foreground: var(--on-error);
  --neutral: var(--surface-container-highest);
  --neutral-foreground: var(--on-surface);
  --border: var(--outline-variant);
  --input: var(--outline);
  --ring: var(--primary);
  --sidebar: var(--surface-container-low);
  --sidebar-foreground: var(--on-surface);
  --sidebar-primary: var(--primary);
  --sidebar-primary-foreground: var(--on-primary);
  --sidebar-accent: var(--surface-container);
  --sidebar-accent-foreground: var(--on-surface);
  --sidebar-border: var(--outline-variant);
  --sidebar-ring: var(--primary);
  --sidebar-active-bg: var(--primary-container);
  --sidebar-active-foreground: var(--on-primary-container);
  --skeleton-base: var(--surface-container-high);
  --skeleton-highlight: var(--surface-container-lowest);
  --table-row: var(--surface);
  --table-header: var(--surface-container-low);
  --table-header-hover: var(--surface-container);
  --table-disabled: var(--surface-container-high);
  --table-disabled-hover: var(--surface-container-highest);
  --table-disabled-border: var(--outline);`
}

function createStatusSchemes(sourceSeed, isDark) {
  const source = argbFromHex(sourceSeed)

  return Object.fromEntries(
    Object.entries(STATUS_SEEDS).map(([name, seed]) => {
      const harmonizedSeed = hexFromArgb(
        Blend.harmonize(argbFromHex(seed), source)
      )
      return [name, createScheme(harmonizedSeed, isDark)]
    })
  )
}

function renderStatusVariables(statusSchemes, prefix = '') {
  return `  --${prefix}success: ${hexFromArgb(statusSchemes.success.primary)};
  --${prefix}success-foreground: ${hexFromArgb(statusSchemes.success.onPrimary)};
  --${prefix}success-container: ${hexFromArgb(statusSchemes.success.primaryContainer)};
  --${prefix}on-success-container: ${hexFromArgb(statusSchemes.success.onPrimaryContainer)};
  --${prefix}warning: ${hexFromArgb(statusSchemes.warning.primary)};
  --${prefix}warning-foreground: ${hexFromArgb(statusSchemes.warning.onPrimary)};
  --${prefix}warning-container: ${hexFromArgb(statusSchemes.warning.primaryContainer)};
  --${prefix}on-warning-container: ${hexFromArgb(statusSchemes.warning.onPrimaryContainer)};
  --${prefix}info: ${hexFromArgb(statusSchemes.info.primary)};
  --${prefix}info-foreground: ${hexFromArgb(statusSchemes.info.onPrimary)};
  --${prefix}info-container: ${hexFromArgb(statusSchemes.info.primaryContainer)};
  --${prefix}on-info-container: ${hexFromArgb(statusSchemes.info.onPrimaryContainer)};`
}

function renderCharts(scheme, statusSchemes, isDark, prefix = '') {
  const chartColors = [
    scheme.primary,
    scheme.tertiary,
    statusSchemes.success.primary,
    statusSchemes.warning.primary,
    scheme.error,
    statusSchemes.violet.primary,
    scheme.secondary,
    statusSchemes.info.tertiary,
    statusSchemes.success.tertiary,
    statusSchemes.warning.tertiary,
    statusSchemes.violet.tertiary,
    scheme.primaryPalette.tone(isDark ? 70 : 50),
  ]

  return chartColors
    .map(
      (color, index) =>
        `  --${prefix}chart-${index + 1}: ${hexFromArgb(color)};`
    )
    .join('\n')
}

function renderThemeBlock(selector, seed, scheme, isDark) {
  const statusSchemes = createStatusSchemes(seed, isDark)
  validateStatusSchemes(
    `preset:${selector}:${isDark ? 'dark' : 'light'}:status`,
    statusSchemes
  )
  return `${selector} {
${renderSchemeVariables(scheme)}
${renderComponentAliases()}
${renderStatusVariables(statusSchemes)}
${renderCharts(scheme, statusSchemes, isDark)}
}`
}

function validateStatusSchemes(name, statusSchemes) {
  for (const [statusName, scheme] of Object.entries(statusSchemes)) {
    validateScheme(`${name}:${statusName}`, scheme)
  }
}

function renderPresetPreviewVariables(isDark, platformScheme) {
  const schemes = [
    { key: 'default', scheme: platformScheme },
    ...PRESETS.map((preset) => ({
      key: preset.key,
      scheme: createScheme(preset.seed, isDark, preset.scheme),
    })),
  ]

  return schemes
    .map(
      ({
        key,
        scheme,
      }) => `  --preset-${key}-surface: ${hexFromArgb(scheme.surfaceContainerHighest)};
  --preset-${key}-container: ${hexFromArgb(scheme.primaryContainer)};
  --preset-${key}-primary: ${hexFromArgb(scheme.primary)};`
    )
    .join('\n')
}

function renderRootBlock(isDark) {
  const selector = isDark ? '.dark' : ':root'
  const workspaceSchemes = Object.fromEntries(
    WORKSPACES.map((workspace) => {
      const scheme = createScheme(
        workspace.seed,
        workspace.forceDark ? true : isDark,
        workspace.scheme
      )
      validateScheme(
        `workspace:${workspace.key}:${isDark ? 'dark' : 'light'}`,
        scheme
      )
      return [workspace.key, scheme]
    })
  )
  const statusSchemes = Object.fromEntries(
    WORKSPACES.map((workspace) => {
      const schemes = createStatusSchemes(
        workspace.seed,
        workspace.forceDark ? true : isDark
      )
      validateStatusSchemes(
        `workspace:${workspace.key}:${isDark ? 'dark' : 'light'}:status`,
        schemes
      )
      return [workspace.key, schemes]
    })
  )
  const paletteVariables = WORKSPACES.map((workspace) =>
    renderSchemeVariables(
      workspaceSchemes[workspace.key],
      `tone-${workspace.key}-`
    )
  ).join('\n\n')
  const workspaceStatusVariables = WORKSPACES.map((workspace) =>
    renderStatusVariables(
      statusSchemes[workspace.key],
      `tone-${workspace.key}-`
    )
  ).join('\n\n')
  const workspaceChartVariables = WORKSPACES.map((workspace) =>
    renderCharts(
      workspaceSchemes[workspace.key],
      statusSchemes[workspace.key],
      isDark,
      `tone-${workspace.key}-`
    )
  ).join('\n\n')
  const navigationVariables = WORKSPACES.map(
    (
      workspace
    ) => `  --nav-${workspace.key}-container: var(--tone-${workspace.key}-primary-container);
  --nav-${workspace.key}-on-container: var(--tone-${workspace.key}-on-primary-container);`
  ).join('\n')

  return `${selector} {
${paletteVariables}

${workspaceStatusVariables}

${workspaceChartVariables}

${renderPresetPreviewVariables(isDark, workspaceSchemes.platform)}

${renderSchemeAliases('tone-platform-')}
${renderComponentAliases()}
${renderStatusVariables(statusSchemes.platform)}
${renderCharts(workspaceSchemes.platform, statusSchemes.platform, isDark)}
${navigationVariables}
}`
}

function renderPageToneBlocks() {
  return WORKSPACES.map((workspace) => {
    const aliases = MATERIAL_ROLES.map(([cssName]) =>
      renderAliasVariable(`page-${cssName}`, `tone-${workspace.key}-${cssName}`)
    ).join('\n')
    const statusAliases = [
      'success',
      'success-foreground',
      'success-container',
      'on-success-container',
      'warning',
      'warning-foreground',
      'warning-container',
      'on-warning-container',
      'info',
      'info-foreground',
      'info-container',
      'on-info-container',
    ]
      .map((name) => `  --page-${name}: var(--tone-${workspace.key}-${name});`)
      .join('\n')
    const chartAliases = Array.from(
      { length: 12 },
      (_, index) =>
        `  --page-chart-${index + 1}: var(--tone-${workspace.key}-chart-${index + 1});`
    ).join('\n')
    return `[data-page-tone='${workspace.route}'] {
${aliases}
${statusAliases}
${chartAliases}
}`
  }).join('\n\n')
}

function renderNavigationToneBlocks() {
  return WORKSPACES.map(
    (workspace) => `[data-nav-tone='${workspace.route}'] {
  --sidebar-active-bg: var(--nav-${workspace.key}-container);
  --sidebar-active-foreground: var(--nav-${workspace.key}-on-container);
}`
  ).join('\n\n')
}

function renderPresetBlocks() {
  return PRESETS.flatMap((preset) => {
    const lightScheme = createScheme(preset.seed, false, preset.scheme)
    const darkScheme = createScheme(preset.seed, true, preset.scheme)
    validateScheme(`preset:${preset.key}:light`, lightScheme)
    validateScheme(`preset:${preset.key}:dark`, darkScheme)
    return [
      renderThemeBlock(
        `[data-theme-preset='${preset.key}']`,
        preset.seed,
        lightScheme,
        false
      ),
      renderThemeBlock(
        `.dark [data-theme-preset='${preset.key}']`,
        preset.seed,
        darkScheme,
        true
      ),
    ]
  }).join('\n\n')
}

const GENERATED_CSS = `/*
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
/*
 * Generated by scripts/generate-material-colors.mjs.
 * Source: @material/material-color-utilities 0.4.0, Material 3 dynamic schemes
 * (2021 specification, standard contrast). Do not edit by hand.
 */

${renderRootBlock(false)}

${renderRootBlock(true)}

${renderPageToneBlocks()}

${renderNavigationToneBlocks()}

${renderPresetBlocks()}
`

if (CHECK_MODE) {
  let current = ''
  try {
    current = readFileSync(OUTPUT_PATH, 'utf8')
  } catch {
    throw new Error(`Missing generated stylesheet: ${OUTPUT_PATH}`)
  }
  if (current !== GENERATED_CSS) {
    throw new Error(
      'Material color stylesheet is stale. Run bun run theme:generate.'
    )
  }
} else {
  writeFileSync(OUTPUT_PATH, GENERATED_CSS)
}
