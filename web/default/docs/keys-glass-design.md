# Keys-only glass pilot

Scope: `/keys`, including its header and Dock. Other routes retain the existing
Unity skin. No billing, key creation or permission logic changes.

## Direction contract

THESIS: An immersive key workspace, not a dashboard inside a decorated frame.
OWN-WORLD: User-supplied nebula, frosted cards, white edge light, black edge-attached controls.
STORY: Find a key, select it, inspect and use the existing actions.
FIRST VIEWPORT: Search and status filters above two card columns; inline inspector flush right; low Dock centered at the bottom.
FORM: Explicitly user-selected reference; no random concept selection. Subsequent user requests remove all-keys/details headings and recent-use panel.
FINISH: Browser-check desktop and small screens, test existing card behavior, document the bounded route exception; do not publish.

## Material and shape

- Wallpaper: `public/assets/keys-glass/background.jpg`, unchanged user-provided JPEG.
- Cards: 24px backdrop blur, translucent dark fill, 22px radius, no texture layer.
- Edge ring: white conic alpha 9%–55%; upper-left/lower-right quieter;
  upper-right/lower-left brighter. Normal width 0.5px, selected width 0.75px.
  No transparent physical border offset: mask ring aligns with the card edge.
- Single-line page buttons and search field: fully rounded runway/pill shapes.
- Floating controls share `--key-control-fill: rgb(255 255 255 / 2%)`, 24px
  blur and the card's edge-light token, including header islands, filters,
  search, action menus and pagination. Selected controls use a stronger edge,
  not a darker fill. Reduced-transparency/high-contrast preferences use a solid
  fallback. This does not change the black structural Dock/inspector.
- Inspector: black scalable silhouette, concave upper-left shoulder, flush
  screen-right, 10px clearance below the header, subtle white gradient stroke.
- Dock: 82px desktop / 76px narrow screens; line icons, text only on the active
  route, no colored selection circle. Accessible names remain on every link.
- Typography: existing Public Sans + Noto Sans SC; key names carry hierarchy.
- Header: no full-width paint, divider, shadow or backdrop blur. Brand, title,
  balance, usage and action controls are separate rounded islands with the same
  faint white edge light. Only the individual islands receive pointer events.

## Layout and accessibility

The page itself is fixed to the available viewport. Large lists scroll within
the rack. The inspector body can scroll on short/narrow windows, while its
frame stays fixed. Narrow layouts stack the two bounded panels. No action is
removed to force a fit. Existing search, filters, pagination, row menus,
selection mode, finite/unlimited quota, role checks and creation flow remain.
Keyboard focus remains visible; reduced-motion and non-blur fallback exist.
Dialogs retain their previous design in this scoped pilot.

## QA

See `../design-qa.md`. Generated reference differences are intentional where
the user requested no grain, subtler borders, pills, smaller Dock, or removed
headings. The source palette warnings from the design detector reflect this
explicit route exception, not a global palette replacement.
