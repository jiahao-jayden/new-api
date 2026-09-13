# Unity UI asset import

The application uses a selected set of original **Layer Lab — GUI Pro - Simple Casual** textures and fonts from the user-provided package. The asset inventory, original Unity paths, GUIDs, sprite IDs, borders, dimensions, source hashes and output hashes are recorded in [unity-ui-assets.json](unity-ui-assets.json). The source package, PSDs, scenes and scripts are not included in the web build. Rights remain with the original asset and font authors; this import does not grant standalone redistribution rights.

Each PNG also carries its source origin in a deterministic `impeccable:prompt` text chunk. This identifies sourced artwork, not an image-generation prompt. Inserting that metadata does not decode or recompress the image: every other PNG chunk, including compressed image data, stays byte-for-byte intact. The manifest retains original source hashes, the pre-metadata PNG hash (`imagePayloadSha256`) and the final published hash. `impeccable embed-prompt --scan public/assets/unity-ui` verifies embedded origin coverage.

## Regeneration

Extract the licensed `.unitypackage` into a temporary directory. Its normal layout is one GUID directory per asset containing `pathname`, `asset` and `asset.meta`. Run from `web/default`:

```sh
bun scripts/import-unity-ui.mjs \
  --source /path/to/extracted-package \
  --package /path/to/original.unitypackage \
  --sharp-module /path/to/node_modules/sharp
bun test scripts/import-unity-ui.test.mjs
bun scripts/build-unity-neutral.mjs
bun test scripts/build-unity-neutral.test.mjs
bun scripts/build-unity-semantic.mjs
bun test scripts/build-unity-semantic.test.mjs
```

`sharp` is an offline import dependency. The optional `--sharp-module` argument accepts an installed module directory; omit it when `sharp` is already locally resolvable. Regeneration writes the selected public assets, their stylesheet and the provenance manifest. It does not read or execute any Unity scripts.

## Texture contract

Load `/assets/unity-ui/unity-ui.css` once, followed by `/assets/unity-ui/unity-neutral.css` and `/assets/unity-ui/unity-semantic.css`. Each named source surface exposes `--game-{name}-image`, `--game-{name}-slice` and `--game-{name}-width`. The second stylesheet changes approved legacy/off-state image variables. The semantic stylesheet only declares opt-in role image/label/muted variables; it does not repaint components by itself. All adapters preserve the console's original-website exclusion. The `.game-surface-{name}` class assigns source values to `--game-surface-image`, `--game-surface-slice` and `--game-surface-width`. Frames can be painted directly with a zero-width layout border or on a decorative pseudo-element:

```css
.game-surface::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-image-source: var(--game-surface-image);
  border-image-slice: var(--game-surface-slice) fill;
  border-image-width: var(--game-surface-width);
  border-image-repeat: stretch;
}
```

A separate decorative element, or a zero-width border with explicit border-image widths, keeps the original image borders independent of content padding, hit targets and focus outlines. `panel`, `panel-muted`, `list`, `list-selected`, `table`, `table-inner`, `popup`, `popup-inner`, `nav`, `nav-selected`, `tab-menu`, `input`, button variants and progress-track/fill variants use the original pack artwork. `background` is the pack's dark vertical gradient. `card-header` and `card-footer` are separate original layers for layered card treatments. Shared dialog bodies now use `popup-window` (`Popup02_Frame1.png`) and a separate `popup-cap` (`Popup02_Frame2.png`) from the Settings Dark prefab. The cap is unsliced, retains its 496:103 aspect ratio and is centered above the body; the header itself stays transparent, and action footers use the source `popup-footer` strip. Sheets omit the cap. These two imports bring the inventory to 427 assets; all earlier 425 published asset hashes remain unchanged.

The manifest also audits direct Image layers in the original Dark prefabs, preserving their color and mask metadata. A Dark folder does not guarantee a painted dark texture: the all-white `TableFrame01_2_(Mask)` is covered by a child demo image in Unity, so `table-inner` uses the original navy `TableFrame03_2` instead. Bright gray content surfaces are likewise replaced with original dark variants. No invented tint is baked into the textures. Import and regression checks require every dark content surface center to retain at least 4.5:1 white-text contrast. Bright primary/success/warning source buttons use dark labels; the approved darker red runtime adapter uses a white destructive-action label instead.

Checkbox, radio and switch textures are unsliced originals at `/assets/unity-ui/controls/{name}.png`, with matching `--game-{name}-image` variables. Functional white pictograms are at `/assets/unity-ui/picto/{source-name-in-kebab-case}.png`, and selected colorful navigation items are at `/assets/unity-ui/items/{source-name-in-kebab-case}.png`. Icons are decorative when paired with an existing accessible label. Font families are `Unity Rubik` (500 and 600) and `Unity Quicksand` (700), with `font-display: swap`; application font stacks retain their CJK and system fallbacks.

## Source-preserving runtime paint

The user's HIG-influenced neutral-dark revision explicitly permits paint adapters while preserving the supplied artwork. `scripts/build-unity-neutral.mjs` reads the provenance manifest, verifies source PNG hashes/dimensions and emits 41 self-contained SVG images plus the overriding stylesheet. Each SVG embeds the complete published PNG as data, records its source hashes and transform, and retains the original dimensions and alpha. This paint step does not rewrite source files, compressed PNG payloads, existing manifest asset hashes, corners or nine-slice definitions.

Structural surfaces and off-state controls are desaturated in sRGB; the selected navigation tile also receives an RGB gain of 0.5 to avoid a glaring pale surface. The destructive button is a separate hue-preserving adapter using RGB gain 0.68, paired with the white `--game-danger-label`. The generator is the authority for this gain; adapter tests check label contrast through normal, hover and pressed paint, not just a flat theme swatch. Primary/success/warning buttons, active controls, progress fills, source icons and illustrations retain their color. A filter is scoped to the embedded image, never to the DOM element or its content descendants.

The generated stylesheet uses `html:root:where(:not(:has([data-original-website])))`: this beats the source image defaults without touching the original landing website. Continue to use the same image/slice/width variables in components; do not reference a PNG directly when that component is meant to inherit the adapter. Run `bun scripts/build-unity-neutral.mjs --check` to verify generated outputs. Adapter regression coverage checks source identity, alpha/geometry, approved scope and deterministic output; it does not replace visual inspection of each changed control state.

## Purpose-specific materials and information hierarchy

The user-pinned Unity demo establishes quiet original information supports, bounded bright product faces and meaningful action/state color. It supersedes the rejected full-surface rainbow implementation. `scripts/build-unity-semantic.mjs` verifies each approved source's hash and dimensions, embeds that complete PNG, and applies an image-only sRGB tonal mapping with identity alpha. Its 40-role inventory is authoritative for available paints: button paints originate from `button-secondary`, chart fills from `progress-fill`, panels from `panel`, model frame edges from `card-frame`, and popup/cap/footer/input paints from their matching original sources. Geometry and slices always come from that source, never from another adapter whose color happens to match. A generated role does not authorize filling an ordinary information container with that color.

The utility role is the 40th adapter. It maps the original secondary-button image from `#334763` to `#425a7b`, uses `#f4f7ff` label ink, and retains the complete published PNG and its geometry. Shared secondary/outline actions, unselected recharge amounts and quiet Dock tiles use this material. Primary/selected controls retain their explicit brighter emphasis. Ghost controls use the original `button-flat` image with its own `43 46 41 46` slices. Source PNG files and the 431-original inventory are unchanged.

The native `CardFrame02,03_BackFrame_n_{Blue,Green,Yellow,Purple}` backgrounds are now imported as `product-back-*`, bringing the original inventory to 431 assets. Their full 251×255 artwork, including the diagonal sheen, is unchanged. These zero-border images are background layers clipped inside the original frame, not nine-sliced. Anthropic/Qwen use purple, OpenAI green, Google yellow and DeepSeek/other cyan. Price comparisons sit on a separate navy information seat. Original native window/cap/footer and HUD/Dock structural artwork are used where a quiet information container is appropriate; active choices have their own functional colors.

The canvas remains charcoal; shared information panels, account/wallet sections, key cards and price/detail seats use quiet original navy frames. Profile identity is a compact strip, key identity uses the original gold-key emblem, model identity occupies a bounded native face, and Dock selection uses a small outline around a quiet tile. Cyan actions, green success/rewards, light-gold monetary text and purple referral-copy paint retain specific jobs. Blue Alipay and green WeChat control fills are brand-inspired dark-mode adaptations that support white labels, not literal official brand swatches. Other bright materials use their generated dark label and muted-ink tokens. Original colorful icons, logos and chart data stay independent. Do not reintroduce saturated nested panels, an all-blue/all-gray treatment, terracotta surfaces or a route-wide hue replacement.

Run `bun scripts/build-unity-semantic.mjs --check` to check deterministic outputs. Tests verify complete embedded PNG identity, source hashes, alpha/geometry, allowed source-role pairs, original-website exclusion and a variables-only generated stylesheet. Every labeled material's foreground is tested across its tonal endpoints and normal/hover/pressed brightness to meet 4.5:1; this is an asset-level contract, not a claim that every rendered page or interaction passed browser QA. No source files or published original PNG hashes are changed by this paint step.

## Why the sprite centers are normalized

Many original Unity sprites have borders whose sums equal the image dimension. For example, the primary blue button is 94 × 138 with left/right borders of 47/47 and top/bottom borders of 68/70. Unity stretches the shared UV boundary; CSS `border-image` has an empty center for those dimensions and omits the corresponding area.

The importer inserts two identical columns or rows only when that center is empty. Each inserted pixel is the bilinear RGBA sample at the shared boundary between the original pixels. Every original corner and edge pixel stays intact, and the original border values remain unchanged. The primary button therefore becomes 96 × 140 while retaining the original 68/47/70/47 CSS slices. PNGs without an empty center retain every original chunk plus their new origin text; all fonts are copied byte-for-byte. The regression checks cover both-axis and one-axis seams, Unity's bottom-to-top coordinate conversion, untouched image payloads, deterministic embedded origins, all published file hashes, image dimensions and nonempty CSS centers.
