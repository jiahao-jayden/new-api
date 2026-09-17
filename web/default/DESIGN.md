---
name: Dot API console
description: Wallpaper-backed frosted glass console with fine white highlights, floating controls and Untitled line icons. Original marketing website excluded.
colors:
  primary: 'rgb(255 255 255 / 80%)'
  primary-foreground: '#11151c'
  background: 'transparent'
  foreground: 'rgb(255 255 255 / 80%)'
  card: 'rgb(255 255 255 / 2%)'
  popover: '#13151d'
  secondary: 'rgb(255 255 255 / 2%)'
  muted: 'rgb(255 255 255 / 2%)'
  muted-foreground: 'rgb(255 255 255 / 60%)'
  accent: 'rgb(255 255 255 / 6%)'
  border: 'rgb(255 255 255 / 12%)'
  input: 'rgb(255 255 255 / 16%)'
  ring: 'rgb(255 255 255 / 70%)'
  destructive: '#ffb4ab'
  success: '#69edcd'
typography:
  headline:
    fontFamily: "'Public Sans Variable', 'Noto Sans SC Variable', sans-serif"
    fontSize: '24px'
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: '-0.02em'
  title:
    fontFamily: "'Public Sans Variable', 'Noto Sans SC Variable', sans-serif"
    fontSize: '18px'
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "'Public Sans Variable', 'Noto Sans SC Variable', sans-serif"
    fontWeight: 400
  label:
    fontFamily: "'Public Sans Variable', 'Noto Sans SC Variable', sans-serif"
    fontWeight: 500
  dialog-title:
    fontFamily: "'Public Sans Variable', 'Noto Sans SC Variable', sans-serif"
    fontSize: '22px'
    fontWeight: 600
    letterSpacing: '-0.02em'
rounded:
  control: '999px'
  multiline: '16px'
  menu: '18px'
  panel: '22px'
  popup: '24px'
spacing:
  icon-gap: '8px'
  related: '12px'
  mobile-inset: '16px'
  panel-gap: '20px'
  workspace-gap: '24px'
components:
  button-primary:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
  button-secondary:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
  button-destructive:
    backgroundColor: '{colors.card}'
    textColor: '{colors.destructive}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
  input:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
  textarea:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.multiline}'
  panel:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.panel}'
  popup:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.popup}'
  menu:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.menu}'
    padding: '8px'
---

# Design System: Dot API console

## Current specification — Glass console (2026-09-17)

The approved Keys design now applies to every console and public utility page,
including menus and overlays. This supersedes the Unity specification and
keys-only exception below; those sections remain historical context, not the
current appearance contract. The original website at `/` and embedded website
at `/dashboard/overview` remain untouched.

- Use the supplied wallpaper, restrained translucent surfaces and the approved
  floating header islands. No full-width header paint or divider.
- Display the original wallpaper directly: no page-wide tint, filter or blur.
  Modal focus dimming may remain, but full-screen backdrops must not blur;
  frosting belongs only to the cards, controls and popup content.
- Surface fill is white at 2%, card backdrop blur 100px (small controls 24px), primary text/icons white at
  80%, secondary text white at 60%. No internal glass texture.
- Edge highlights are 0.5px conic white gradients: lower alpha at top-left and
  bottom-right, higher alpha at top-right and bottom-left. Match the Keys pilot.
- Single-line actions use runway shapes. Multi-line fields retain comfortable
  rounded rectangles; never turn textareas into thin pills.
- Dock is 64px high with line-icon controls and no persistent labels, including
  the selected item. Only the shaped black base is opaque; surrounding footer
  space stays transparent and pointer-transparent. The Dock is a fixed overlay,
  not a reserved footer: the workspace continues to the viewport bottom. Tooltips appear
  immediately on hover or keyboard focus; no cyan selection ring.
  Dock styling is scoped independently from page styling, so the embedded
  original website uses this same navigation without changing its own design.
- Preserve real semantic states and payment-provider identities. Color must
  not create new statuses or imply unavailable actions.
- Keep the outer viewport stable; large lists, forms and inspectors scroll
  internally. Preserve all columns, controls, existing tabs and keyboard flow.
- Follow `--font-sans` and the approved Keys type hierarchy; do not restore the
  historic game-font override.

The shared implementation is `src/styles/console-glass.css` plus the scoped
`glass-*.css` files. The [rollout contract](docs/glass-rollout.md) records route
families, independent generated references, dark-backing exceptions for
overlapping surfaces, implementation ownership and behavior boundaries.
`design-qa.md` records verification and explicit coverage limitations.

**Functional invariant:** this is a visual migration only. Existing backend,
pricing, currency conversion, permissions, routing, fields, copy and actions
remain authoritative. A generated demo is never permission to add, remove or
rename a feature. No push or deployment is part of this migration.

The frontmatter describes the shared glass defaults extracted from the current
styles. Body and control sizes, component padding, responsive breakpoints and
semantic colors outside this compact token set remain contextual; no universal
scale is inferred from a single route. The sidecar carries the blur, conic edge,
contrast backings and current component previews. It retains the former sidecar
under explicitly historical metadata.

## Historical Unity specification

The remainder of this document describes the prior game-art implementation.
Its palette, geometry and source-art requirements do not override the current
glass specification above. Existing artwork/provenance files remain preserved.

<details>
<summary>Superseded machine-readable token snapshot (preserved 2026-09-17)</summary>

This is the pre-reconciliation metadata, including its partially updated glass
colors and historical Unity typography and shapes. It is archival, not a source
for new screens.

```yaml
---
name: Dot API console
description: Wallpaper-backed frosted glass console with fine white highlights, floating controls and Untitled line icons. Original marketing website excluded.
colors:
  primary: 'rgb(255 255 255 / 80%)'
  primary-foreground: '#102039'
  background: 'transparent'
  foreground: 'rgb(255 255 255 / 80%)'
  card: 'rgb(255 255 255 / 2%)'
  popover: '#13151d'
  secondary: 'rgb(255 255 255 / 2%)'
  muted: 'rgb(255 255 255 / 2%)'
  muted-foreground: 'rgb(255 255 255 / 60%)'
  accent: 'rgb(255 255 255 / 6%)'
  border: 'rgb(255 255 255 / 12%)'
  ring: 'rgb(255 255 255 / 70%)'
  destructive: '#ffb4ab'
  success: '#a1e79a'
  warning: '#ffce74'
  chart-4: '#c9b6ff'
  workspace-foreground: '#edf3ff'
  workspace-muted: '#b5c5dc'
  wallet-muted: '#b7c7dc'
  utility-low: '#334763'
  utility-high: '#425a7b'
  utility-label: '#f4f7ff'
  ghost-label: '#d3e2f7'
  monetary-ink: '#ffce83'
typography:
  headline:
    fontFamily: "'Unity Rubik', 'Noto Sans SC Variable', 'PingFang SC', sans-serif"
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 'normal'
  title:
    fontFamily: "'Unity Rubik', 'Noto Sans SC Variable', 'PingFang SC', sans-serif"
    fontSize: '16px'
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 'normal'
  body:
    fontFamily: "'Unity Rubik', 'Noto Sans SC Variable', 'PingFang SC', sans-serif"
    fontWeight: 500
    lineHeight: 1.55
  label:
    fontFamily: "'Unity Rubik', 'Noto Sans SC Variable', 'PingFang SC', sans-serif"
    fontSize: '14px'
    fontWeight: 600
    letterSpacing: 'normal'
  description:
    fontSize: '13px'
    lineHeight: 1.6
  dialog-title:
    fontSize: '22px'
    fontWeight: 600
    lineHeight: 1.45
  metric:
    fontSize: '22px'
    fontWeight: 600
    lineHeight: 1.3
  metric-mobile:
    fontSize: '18px'
  balance:
    fontSize: 'clamp(28px, 2.5vw, 36px)'
rounded:
  badge: '7px'
  control: '10px'
  group: '12px'
  panel: '14px'
  table: '16px'
  rack-card: '1.125rem'
  popup: '22px'
spacing:
  compact: '4px'
  icon-gap: '8px'
  related: '12px'
  rack-gap: '14px'
  mobile-inset: '16px'
  panel-gap: '20px'
  card-inset: '22px'
components:
  button-primary:
    textColor: '{colors.primary-foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '10px 18px 12px'
  button-secondary:
    textColor: '{colors.utility-label}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '10px 18px 12px'
  button-destructive:
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '10px 18px 12px'
  button-ghost:
    textColor: '{colors.ghost-label}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '10px 18px 12px'
  button-link:
    textColor: '{colors.primary}'
    typography: '{typography.label}'
    padding: '10px 18px 12px'
  input:
    textColor: '{colors.foreground}'
    rounded: '{rounded.control}'
    padding: '11px 14px'
  panel:
    textColor: '{colors.foreground}'
    rounded: '{rounded.panel}'
    padding: '20px 22px'
  badge:
    rounded: '{rounded.badge}'
    padding: '4px 9px'
  dock-item:
    width: '80px'
    height: '70px'
    padding: '0px'
  switch:
    width: '54px'
    height: '28px'
---
```

</details>

## Overview

**Creative North Star: "Unity dark console"**

Original LayerLab GUI Pro - Simple Casual(+PSD) 1.0.7 artwork defines this console: authored frames and bevels, original pictograms and colorful action/status assets. The pinned Unity demo separates quiet navy information supports from bounded bright product faces and meaningful actions. The user rejected the full-surface rainbow treatment: identity, settings, balances and detail containers use the original dark supports; cyan primary actions, native product colors, payment identities and small semantic accents establish hierarchy. Apple's HIG informs legibility, control sizing and feedback. These are custom web adaptations, not literal Apple system colors.

This documents the implemented console and its shared administration, account, authentication and transient surfaces. The original marketing website is explicitly excluded: preserve `public/dotapi-landing.html`, the original Home/header composition and its console navigation bridge. All game styles exclude documents containing `[data-original-website]`; keep that guard zero-specificity with `:where()` so it does not override component states.

The frontmatter records reused semantic colors and observed dimensions. Actual painted surfaces are the imported PNGs and their slice variables, with approved image-only SVG paint adapters, not flat approximations of these colors. Resolve future drift against `src/styles/game-{theme,ui,shell,pages,workspaces,account}.css`, `public/assets/unity-ui/unity-ui.css`, `public/assets/unity-ui/unity-neutral.css`, and the [asset provenance contract](../../docs/unity-ui-assets.md) with its [manifest](../../docs/unity-ui-assets.json). The schemaVersion 2 [sidecar](.impeccable/design.json) supplies asset-backed previews and extensions; it is documentation, not a second runtime theme.

**Key Characteristics:**

- Charcoal canvas and original navy information frames, with bounded bright product faces and color on actions, values and states.
- Rubik with CJK fallback, visible values and comfortable separation between controls.
- A compact status bar and original-icon Dock around task-oriented workspaces.
- Shared native control behavior beneath sprite-backed visual states.
- Existing product, data, attribution and landing-site boundaries remain intact.

Earlier migration captures record earlier treatments and are not acceptance evidence for this hierarchy correction. The current profile desktop/mobile and 1020px captures are in `../../.impeccable/review/`; wallet, model and key captures are in `../../.artifacts/hierarchy-redesign/`. Current validation and the bounded review verdict belong in `design-qa.md`; this documentation does not certify complete accessibility, business-flow coverage or browser coverage of every rare admin route, dialog or provider configuration.

## Colors

The charcoal canvas supports original navy information frames, light information text and bright controls with matching dark ink. Color identifies an action, product, monetary fact or actual state; it does not justify painting every parent and child container. Avoid all-blue, all-gray, terracotta and route-wide hue replacements. Source-preserving SVG adapters retain texture, bevels, geometry and alpha; colorful original icons remain intact.

### Per-component assignment

| Element and purpose              | Material / color assignment                                                                                                                                                                                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared information supports      | Original navy panel/list/window art with light primary and supporting ink. Parent and child frames stay quiet.                                                                                                                                                                                               |
| Secondary and outline actions    | Utility paint of the original secondary button, with its light label; ghost actions use the original flat-button image and its own slices.                                                                                                                                                                   |
| Primary action / selected choice | Original cyan primary button or an explicit cyan information/amount paint. Selection also has an outline or another non-color cue.                                                                                                                                                                           |
| Alipay / WeChat                  | Blue / green source-button paint with white labels; dark-mode brand-inspired fills, not exact official RGB claims.                                                                                                                                                                                           |
| Wallet                           | Quiet balance, recharge and referral frames, original coin/gift items, light-gold monetary facts and green earned rewards. Unselected recharge presets use utility paint, selected amounts cyan, referral copy purple, transfer green.                                                                       |
| API keys                         | Inventory cards use a name-first blue title banner with a small original key icon. The quiet information base groups the masked token, actual status and recessed quota ledger. Details and recent-use rows remain quiet; create is cyan, utility menus/copy are subdued and destructive actions retain red. |
| Model cards                      | Bounded original diagonal-sheen faces: Anthropic/Qwen purple, OpenAI green, Google yellow, DeepSeek/other cyan. The body and prices use quiet original frames. Details use a navy support and a small vendor chip. Product colors are category materials, not literal provider brand swatches.               |
| Profile                          | Compact identity/metrics strip and quiet settings, binding, security and notification frames. Balance/currency emphasis is light gold; status and original pictograms carry small accents.                                                                                                                   |
| Usage, rankings and logs         | Quiet frames; requests/traffic cyan, token/model data lavender, monetary facts warm gold, and status/error colors tied to actual states.                                                                                                                                                                     |
| Dock                             | A single navy drawn tray with a layered blue rim and lower bevel. Original colorful Unity icons sit directly on the tray; the current destination rises into a cyan, concave-footed seat with its existing label.                                                                                            |

The runtime source of truth for these paints is `scripts/build-unity-semantic.mjs` and `public/assets/unity-ui/unity-semantic.css`, with assignments in the consuming styles. Its 40 adapters declare opt-in image/label/muted variables; they do not automatically repaint a route or replace a global surface variable. Bright panel/window roles remain available but are not a direction to fill ordinary containers. The utility adapter preserves the complete original secondary-button image and geometry. Earlier neutral adapters remain where explicitly used for disabled/off states, inset controls and legacy chrome.

### Primary

- **Soft blue action** (`primary`): links, purposeful actions, subtle selection outlines and the first chart series. Ordinary prices and decorative pictograms use neutral foreground roles. The primary button itself keeps the original blue/cyan button sprite.
- **Deep action ink** (`primary-foreground`): labels on bright primary controls, not on neutral selected navigation.
- **Light blue focus** (`ring`): visible keyboard outlines independent of sprite edges.

### Neutral

- **Charcoal canvas** (`background`): page fallback beneath the neutral paint of the original vertical background texture.
- **Charcoal fallback** (`card`, `popover`): fallback tokens beneath the original navy information artwork, not substitutes for its texture.
- **Graphite fallback** (`secondary`, `muted`, `accent`): retained primitives for recessed chrome and generic theme fallbacks.
- **Navy information ink** (`workspace-foreground`, `workspace-muted`, `wallet-muted`): light facts and quieter explanations on original dark panels.
- **Utility material** (`utility-low`, `utility-high`, `utility-label`): tonal endpoints and light ink for secondary controls and quiet Dock tiles; rendered through the source-preserving adapter.
- **Flat-control ink** (`ghost-label`): readable light labels on the original flat-button artwork.
- **Soft white text** (`foreground`) and **quiet neutral text** (`muted-foreground`): primary facts versus supporting explanations. Neutral selected controls use light foreground labels.
- **Graphite separator** (`border`): table, metadata and content separators where information benefits from a line.

### Semantic and data accents

- **Coral alert** (`destructive`): error text, invalid-field outlines and destructive context. Destructive buttons retain the pack's red hue with an image-only darkening adapter and the white `--game-danger-label`; do not reuse the dark label intended for a bright pastel fill.
- **Leaf status** (`success`): enabled/success state, never a substitute for its text label.
- **Warm balance** (`warning`, `monetary-ink`): light-gold balance, currency and reward emphasis; monetary facts do not require a yellow container.
- **Lavender series** (`chart-4`): the fourth chart series. The other default series reuse primary, success, warning and destructive colors.

**The Artwork Authority Rule.** Preserve original PNG bytes, hashes, alpha, dimensions, borders and state artwork. Approved image-only SVG paint adapters retain complete source artwork and matching ink. Never filter a content ancestor, repaint a whole route uniformly, invent replacement artwork or bake paint into the source PNGs.

Keep real vendor identities, chart series colors, status semantics, QR codes, media and code highlighting when their distinct appearance communicates business information. Decorative UI pictograms follow the imported pack. These are explicit exceptions to uniform visual skinning.

## Typography

The console uses the imported Rubik medium and semibold fonts with Noto Sans SC Variable, PingFang SC and system sans-serif fallbacks. The package also includes Quicksand bold, but it is not the console's active heading family. Use the implemented Rubik stack for new console headings. Code, tokens and technical payloads keep the existing monospace treatment.

### Hierarchy

- **Headline:** rack and model-page titles use the frontmatter headline role; they introduce the task without dominating the viewport.
- **Title:** common card headings use the title role; account card titles are a contextual 17px variation.
- **Body:** medium-weight text uses the body stack and generous line height. Component sizes are contextual rather than a fabricated global scale.
- **Label:** buttons and controls use the label role; field labels and supporting descriptions use calmer weight and muted color.
- **Dialog title:** the larger popup title role separates a transient task from its fields.
- **Metrics:** profile facts and wallet secondary values use the metric role; profile facts use the mobile variant at its narrow breakpoint. The wallet's leading balance uses the fluid balance role. Numeric values and their units stay together; the surrounding metric layout wraps into another row when space is limited. HUD values retain tabular numerals.

Desktop inputs use 14px; the existing global mobile rule raises inputs, selects and textareas to 16px at 767px and below to avoid browser zoom. Compact metadata can remain 12–13px. Do not lower essential facts to the old 10–11px density. Preserve translations and allow CJK explanations and long identifiers to wrap or use existing disclosure behavior. Keep monetary values and numeric units unbroken.

**The Facts First Rule.** Keep amounts, units, statuses and ambiguous action labels readable; an original icon may replace redundant text only when the control retains an accessible name and appropriate tooltip.

## Layout

Content occupies the remaining viewport between a 72px status bar and the Dock. The standard Dock reserves 128px plus the bottom safe-area inset (104px at 640px and below); settings retain 136px plus that inset for section labels and a second row of category icons. Navigation can scroll horizontally when necessary. Mobile uses a 44px brand action, flexible visible metric columns and a compact action group; it does not remove balances to make room.

Shared panels separate sections with the panel-gap rhythm and use card-inset padding on desktop. Rack cards use the tighter rack-gap rhythm; mobile inset reductions preserve space for text and controls. Grid and inspector composition belongs to each workspace: keys and models retain their racks and inline selection inspector, administration retains usable tables/lists, and settings retain grouped fields.

Profile uses a compact identity header above the account controls. At 1200px and wider, identity, metrics and sign-out share one strip; below that, metrics have their own full-width row. The facts wrap by item, never inside a numeric value or unit. At 1000px and wider, the main settings area uses two columns. A language-preference container at 480px or narrower stacks its selector below the full explanation and gives the selector the available width.

Wallet order is balance → recharge → referral → plans on narrow screens. At 960px it uses two columns; at 1280px, available plans occupy the middle column while balance/referral and recharge sit on either side. Hidden subscription capability does not leave an empty column.

### Responsive behavior

| Observed boundary       | Implemented adaptation                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1180px and below        | Usage panels move from three columns to two; model usage spans the next row.                                                                  |
| 1050px and below        | The HUD hides its secondary route/version text.                                                                                               |
| 900px and below         | The playground becomes one column.                                                                                                            |
| 899px and below         | The key page becomes the single vertical scroller; rack, pagination and inline inspector contribute natural height.                           |
| 767px and below         | The HUD uses its compact grid, Dock items reduce size and form text reaches 16px.                                                             |
| 640px / 639px and below | Panels reduce padding, usage becomes one column and key toolbar controls wrap; the adjacent boundaries are existing component-specific rules. |
| 560px and below         | Dock actions reduce to 44px wide; the navigation menu becomes one column.                                                                     |
| Coarse pointer          | Shared buttons, tabs and menu items receive 44px minimum targets; icon buttons are 44px square.                                               |

Desktop shared buttons have a 40px minimum, with compact variants at 36px and large actions at 48px; existing stepper internals and selection art are smaller. Do not describe every visible control as 44px. On touch surfaces, preserve the larger interactive wrapper/label area and check dense table controls individually.

The key inspector is an explicit aligned-control case: the masked-key reveal field and adjacent copy tile share a 44px height, centered content and an 8px gap. The field flexes while the copy tile stays 44px wide. Use the source input well and source secondary-button tile without changing reveal, copy, loading or tooltip behavior.

The key inventory card is name-first: an 88px minimum blue title banner carries the 26px bold name in the existing dark info ink, with a subordinate 32px original gold/silver key. Its total minimum height is 216px. The banner grows for long names without clipping or overlapping the menu. Below it, the quiet information base groups the masked token and actual status in one wrapping row, then anchors the quota ledger at the bottom. Enabled keys use the original blue product backdrop; inactive keys use the source inset, silver key and light title ink. These are state representations, not invented rarity levels. The 13px masked identifier and 12px status/labels support the title. The quota amount remains whole, with label/value wrapping as complete items when necessary. Finite quotas retain their real progress; unlimited keys do not receive a decorative meter.

The existing 44px action menu sits in the title banner's upper-right corner. When batch selection is available, its separate control sits upper-left and the banner reserves extra space above the title; neither is nested inside the inspect button. Keep the name and masked token readable at narrow widths, preserve the existing rack/inspector responsive flow, and do not extend the bounded product color to the whole page or the unrelated recent-use cards. The selected third ImageGen study is a layout reference only; runtime UI retains original Unity assets and real editable/selectable text, never a flattened mockup image.

## Elevation & Depth

Depth comes from the package's painted rims, recessed input wells and distinct original information, product and control layers above a dark canvas. Shared cards, controls, menus and dialogs suppress additional box shadows. Do not add a second CSS bevel, ambient glow or hover lift to those frames. The Dock's small press translation is a specific navigation behavior, not a general card interaction.

Modal backdrops use a dark scrim with 8px blur. This makes the active task distinct while the popup remains an opaque source frame; it is not a glass material for ordinary panels. Full-screen request-log details intentionally use the page background and nested original panels instead of one oversized popup frame.

**The Source Depth Rule.** Let authored edges carry surface depth; use visible focus outlines and existing modal backdrops for interaction hierarchy.

## Shapes

Corners come from source sprites, rendered with CSS nine-slicing and a filled center. The documented radius roles align content/focus geometry; they do not replace the image's silhouette. Keep borders at zero layout width and specify independent border-image widths, so edge artwork does not consume content padding or shrink hit targets.

The generated surface stylesheet supplies an image, slice and width triplet for each asset. CSS slice order is top/right/bottom/left; source Unity metadata uses left/bottom/right/top. The importer inserts two sampled center pixels only when Unity's shared UV boundary would otherwise become an empty CSS center. Original corner and edge pixels remain intact. Use these generated textures rather than resizing the original package sprite yourself.

Functional pictograms use original white raster art as a color mask. Colorful Dock items preserve their original pixels. The existing SVG wrapper in `GameIcon` is only an accessibility/layout container for raster images and masks, not newly drawn vector artwork. Keep recognizable provider/payment logos, avatars and protected new-api / QuantumNous identities where they carry meaning.

## Components

### Buttons

Tactile source controls retain immediate, modest feedback. Primary actions use the original cyan button. Secondary and outline actions use the utility adapter with its light label. Ghost actions use the original flat-button artwork and its own slice/width triplet. Payment, referral, amount and success controls select their explicit semantic paint and matching label. Destructive confirmation retains its separately audited red source paint and white label; links do not need a border image. Source image paint supplies the textured fill, so a flat theme swatch does not describe every pixel.

Shared buttons use the frontmatter padding, a 40px minimum and content-driven height. Hover darkens to brightness 0.96; press darkens to 0.886 with a 100ms linear transition and no shared-button translation. Disabled state switches to the neutral-adapted disabled source sprite, uses the light foreground and reduces opacity. Keyboard focus uses a 2px outline, usually offset by 3px. Keep Base UI's disabled, form and composition behavior.

### Cards and containers

Original navy panels hold content at rest without lift or added shadow. Bright product identity belongs to a bounded face; prices, settings and supporting information remain on quiet original artwork. Common cards have a 20px vertical rhythm and 22px horizontal inset; header-bearing cards place their padding in the header/content slots. Lists, settings groups and profile rows retain source framing and content-driven dimensions. Table and popup silhouettes remain separate assets.

Key/model cards use existing selected artwork and preserve the inline inspector behavior. Selection, copy and overflow remain separate accessible actions; do not turn the entire nested-action card into one invalid interactive wrapper.

### Inputs and choices

Inset original input frames have a 42px desktop minimum and the frontmatter inset. Textareas start at 100px; content-specific editors may be taller. Focus gets a 2px outline offset by 2px; invalid state uses destructive color. Labels, help and validation messages remain explicit. Composed FormControl and combobox children retain equivalent styling even when their data slot changes.

Tabs and grouped toggles keep their source tracks and explicit selected state. Utility paint supports unselected choices; a selected choice may use cyan with matching dark ink. Avoid treating every available option as a primary action. Checkboxes/radios retain distinct off-state and original colorful on-state layers; indeterminate state retains its semantic bar. Switches use the original 54×28 track with a 22px handle moving 26px over 180ms. That interruptible thumb transition is a web adaptation, not a claim of packaged Unity animation. Native Base UI continues to own checked state and keyboard behavior.

### Badges and status

Small list-frame badges use the badge radius and inset, with a 26px minimum in the shared skin. Text color follows the actual status/variant context. A status badge is not automatically interactive; do not add hover or press behavior to static facts. Keep status text or an equivalent accessible name alongside color.

### Navigation

The standard Dock follows the selected second ImageGen reference (`../../.artifacts/dock-option2/reference.png`). The user's subsequent explicit instruction authorizes **drawn scalable chrome for this Dock only**, superseding the sprite-only rule for its base and selected seat. `console-dock-artwork.tsx` draws a navy face, three-layer blue edge, restrained top light and lower thickness. The selected seat has an arched top and concave flared feet, not an ordinary rounded button. All icons remain original Unity artwork; labels remain real translated text. Generated background studies are not used at runtime.

The 800×96px desktop tray is content-sized, with 80×70px targets, 16px gaps and 24px end insets. SVG endcaps use the actual viewport width, so adding/removing permitted destinations expands the tray without stretching its corners or needing a new bitmap. The selected seat rises 18px above the tray; a 56px icon moves upward and reveals a 16px label. Narrow layouts reduce spacing, icon size and height, reaching 44×54px targets in a 364×76px tray at 390px. Overflow scroll stays inside the Dock. Remove inherited button margins rather than clipping the last destination. Hover/press changes brightness; 260ms ease-in-out transitions animate the seat/icon and a shorter fade reveals the label. Reduced motion removes transitions; focus has a separate visible outline. Each destination retains its accessible name and tooltip.

Settings use readable text sections plus category icons in the two-row Dock. The overflow navigation menu keeps permission-filtered links, headings and public destinations. Do not remove destination labels merely to maximize icon density.

### Overlays and feedback

Menus, tooltips and toast notices retain original source panels and state semantics. Shared dialog, sheet and drawer bodies use the original navy `popup-window` (`Popup02_Frame1.png`) from the pack's Settings Dark composition. Dialogs and alert dialogs add the separate unsliced `popup-cap` (`Popup02_Frame2.png`) above the body, preserving its 496:103 aspect ratio at `min(180px, 40%)` width. The cap/body/footer retain their coordinated original materials and readable light ink. The header remains transparent and centered; the source `popup-footer` holds evenly distributed actions. The key editor adds the original 36px gold-key item on the cap. Edge-attached sheets omit the projecting cap; full-screen log detail remains an intentional exception. Preserve all focus, Escape, return focus, validation and close behavior.

The create-key dialog follows the user's selected third ImageGen reference, with a create-only composition in `game-key-create.css`: an 820px maximum-width original arched window, 26px centered title, and bounded original blue name row with a 52px input. A 168px label rail and 20px gap align name, quota, expiry, model and IP controls. Quota and its unlimited switch share one row; the other fields follow vertically. Original recessed input and popup-inner sprites remain the material authority. Small original pencil, gold coin, lavender calendar, cyan layers and mint shield identify fields without recoloring whole panels. Below 720px, labels stack above controls; the form scrolls without compressing its rows. Equal-width footer actions remain visible at 60px desktop and 48px mobile. Keep the accessible description, existing fields, defaults and validation; the edit-key mode does not inherit this composition.

Backdrop opacity/blur transitions take 220ms; dialogs combine opacity with a restrained 0.97-to-1 scale over 180ms; sheets translate over 240ms. The common curve is `cubic-bezier(0.42, 0, 0.58, 1)`. Reduced-motion rules remove those transitions and the control/thumb animations. Do not attribute these web overlay transitions to Unity prefab animation.

### Data and account surfaces

Usage charts remain driven by actual data. Frames and progress fills use the pack; chart geometry, tooltips, amounts, labels, provider series and semantic colors keep their analytical meaning. Profile and wallet panels keep actual balances, subscription/recharge choices, account bindings, security and notification states. Decoration does not introduce rewards, currencies, achievements or other business capabilities.

The sidecar includes six self-contained visual snippets: primary and secondary buttons, an input, a panel, an outline badge and a Dock. They use the actual published sprite paths and generated slices with live CSS-variable references and fallback values. They require this application's asset origin; labels/values are preview examples, and static snippets do not simulate routing, billing or React/Base UI behavior.

### Usage logs

The common-log workspace extends the existing Unity world using the user's [selected first study](../../.artifacts/logs-option1/reference.png). Its implemented [desktop](../../.artifacts/logs-option1/desktop.png), [tablet](../../.artifacts/logs-option1/tablet.png) and [mobile](../../.artifacts/logs-option1/mobile.png) captures show the composition: a horizontal date/model/token search strip, eight labeled log types below, then one contained ledger. Search and selection use cyan; the trailing tools popover holds the privacy toggle, column visibility and usage statistics. Advanced fields expand beneath the search strip and become inert when closed. The date range takes a full row at 1100px and below; the type strip scrolls horizontally when necessary.

The ledger fills the remaining workspace, with its record body scrolling inside the frame and its pagination footer outside that scroller, above the existing Dock. Tablet overflow stays inside the table. At 640px and below, the existing pinned date range, filter drawer and record cards replace the desktop controls and columns; pagination wraps inside the same ledger. The common administrator table orders time, type, model, tokens, timing, token name, channel, user, cost and details; permitted columns and real records determine the content. Shared task-log tables inherit ledger containment while retaining their category filters.

The local stylesheet `src/styles/game-logs.css` sets the ledger face (#1e3046), header (#263c56), alternating rows (#273a51) and monetary ink (#ffcf7b). These are log-surface assignments only; they do not replace global palette tokens. Table cells default to regular 15px text in 58px content-growing rows, while compact metadata retains its existing sizes. Small type badges use an 8px radius, bounded semantic fills and gold, cyan, lavender, blue, coral or mint ink, with an original pictogram beside a translated label. Long models, usernames and details wrap; dates use tabular numerals. Search and pagination controls retain 44px targets, and type choices have a 48px minimum height. The advanced-fields transition lasts 260ms and is removed for reduced motion.

Original Unity panel/input sprites and the existing `LogTypeIcon` mappings supply the artwork; the generated study supplies layout guidance and no new runtime raster. Preserve the original PNGs and their [provenance](../../docs/unity-ui-assets.md), real amounts and records, permissions, sensitive-field masking, filtering/reset behavior, detail dialogs and loading/empty/error handling. The implementation sources are `logs-filter-toolbar.tsx`, `common-logs-filter-bar.tsx`, `usage-logs-table.tsx` and `columns/common-logs-columns.tsx` under `src/features/usage-logs/components/`.

## Do's and Don'ts

### Do

- Do reuse the original published sprites, approved image-only paint adapters and generated image/slice/width variables for console frames and controls.
- Do retain readable labels, units, statuses, accessible icon names and existing translations.
- Do preserve keyboard focus, native form/selection behavior, touch targets and reduced-motion support.
- Do keep meaningful data visualization, provider/payment branding, avatars, code and protected new-api / QuantumNous attribution.
- Do preserve the original landing website and the zero-specificity original-website exclusions.
- Do verify a changed surface at desktop and mobile sizes, including long content and its relevant overlay states.

### Don't

- Don't replace the approved pack with handcrafted CSS artwork, new SVG pictograms, glass panels or approximated gradients.
- Don't modify the original PNG pixels or hashes, apply page-wide color filters, or stretch sprite corners as whole images; keep approved color changes in the explicit paint adapters.
- Don't create saturated parent-and-child panels, full lavender identity walls, mint forms or cyan information walls. Preserve dark source supports and bounded meaningful color; avoid all-blue, all-gray, terracotta and route-wide hue replacements.
- Don't hide essential values or ambiguous actions behind decorative icons.
- Don't add game mechanics, backend capabilities or business claims during a visual change.
- Don't assume shared skin coverage proves every rare admin route or dialog was browser-tested.
- Don't commit, push or deploy a local visual iteration without a separate request.

### Approved keys-only glass pilot (2026-09-16)

The user explicitly replaced the Unity treatment on `/keys` only. This scoped
exception supersedes the no-glass rule above for this route, not for the rest
of the console. See `docs/keys-glass-design.md` for the implemented material,
edge-attached navigation and fixed-viewport constraints.
