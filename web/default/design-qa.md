# Unity dark console — local verification

Date: 2026-09-13

## Scope and authority

Original LayerLab GUI Pro - Simple Casual(+PSD) 1.0.7 artwork supplied by the user; dark console adaptation with HIG-informed readability, target sizes, keyboard support and reduced motion. Existing functionality, routing permissions, actual values and billing behavior are preserved. Original embedded landing HTML is unchanged from the pre-migration file. Public Home additionally opts out of the Unity skin, including its loading state.

## Evidence

Screenshots are local-only in `.impeccable/review/` and the repository's `.artifacts/unity-qa/`. Representative desktop and 390px mobile captures cover keys, model list and inline details, wallet, profile, usage, logs, channels, settings and key creation; keys/header also checked at 320px. Public Home and the original embedded website have separate confirmation captures.

The browser checks opened forms without submitting keys, payments or setting changes. Pagination was temporarily changed to 100 to verify three-digit visibility and returned to 20. No cloud deployment or Git push was performed.

## Resolved findings

- Source mask layers are no longer used as painted panels; original dark source variants provide the correct surfaces.
- Mobile header actions stay in the 72px header; key search no longer consumes a 336px vertical basis, and cards/pagination/inline inspector follow one scroll flow.
- Native switch geometry no longer combines two translation systems. Model-selector inner inputs no longer retain an extra obsolete border.
- Settings fields have distinct source-framed groups; selected navigation uses readable dark foregrounds on the original blue sprite.
- Profile monetary values remain complete. Shared pagination accommodates three digits without clipping.
- Unity styling is excluded from the original website and the public Home fallback rather than relying only on restoring HTML.

## Verification

- Frontend typecheck: passed.
- Full frontend regression suite: 99 tests passed at visual review closure, including six asset-import tests.
- Changed source lint: passed. This is not a claim that unrelated pre-existing full-repository lint findings were fixed.
- Production build: passed.
- Final post-metadata verification: typecheck, all 99 tests and production build passed again. All 422 raster files carry embedded source origins; regeneration preserves the original image payloads and reproduces the same hashes.
- One manual Impeccable detector pass on the changed game styles and representative component sources: zero findings.
- Independent finish review: `ship`, with no remaining material findings in the reviewed screenshot/source scope.

## Limits

This is a local visual/functional regression check, not an exhaustive browser execution of every administrator form, provider configuration or backend billing path. Real charts remain data-driven graphics; third-party provider brands, user avatars, QR codes and content media retain their original semantics rather than being replaced by unrelated game icons.

Final result: passed for the reviewed scope. Ready for user testing locally; not deployed.

## Neutral-dark and Unity window refinement — 2026-09-13

The user's later correction supersedes the navy-first color direction above. This pass uses HIG principles for restrained color, contrast and aligned controls while keeping the original Unity artwork. Reference: the supplied package's Dark Settings PSD and component demo composites; Apple HIG Color and Dark Mode.

- Structural surfaces, inactive controls, panels and Dock use image-local neutral paint adapters. Original colorful icons, orange switches, green states, gold monetary emphasis and primary-action artwork remain colored. No ancestor grayscale filter is used.
- All 425 previously published asset files and their manifest entries remain unchanged. The exact Settings demo window and unsliced 496:103 arched cap were added, bringing the source inventory to 427 assets and the paint-adapter inventory to 41.
- Common dialogs use the source window/cap and source footer when present; creation uses the original gold-key emblem. Wrapper dialogs preserve body scrolling while allowing the cap outside their rim. Sheets use the same source body without an external cap.
- Masked key/reveal and copy controls measured 44px high with identical top positions at desktop and 390px width. Footer controls measured 44px with identical top positions. No real key was revealed, copied or created.
- Destructive buttons retain the red source hue with a 0.68 RGB paint gain and white labels. Source-pixel contrast checks include hover and pressed filters: approximately 5.38:1 normal, 5.26:1 hover, and 4.99:1 pressed at the brightest opaque source pixel. These are measured custom colors, not literal Apple system-color values.
- The shared billing-history window was additionally checked: arched cap visible, body scroll retained, and low-contrast literal red payment text replaced with the theme's readable semantic red.

Evidence is local-only in `../../.artifacts/neutral-qa/`: desktop models, keys, wallet, key creation and a shared history dialog; mobile models, masked key inspector and key creation. The 390px dialog retained scrollable fields and visible footer actions without horizontal page overflow. Escape/close dismissed the dialog. The viewport override was reset. Public Home still has its original-website opt-out and no Unity body background.

Verification: frontend typecheck passed; 104 frontend tests passed (including 11 asset/provenance/contrast tests); scoped changed-code lint and formatting passed; production build passed. A bounded manual style detector reported only advisory token/type/radius documentation observations, no primary findings. Independent screenshot/source review returned `ship` with no material findings in its reviewed scope; the later shared-wrapper clipping correction was confirmed separately in the browser.

Final result: passed for this refinement's reviewed scope. No backend/billing behavior, public website content, Git push or cloud deployment was changed by this refinement. This is not an exhaustive HIG certification or a browser test of every rare administrator dialog.

## Bright Unity demo component colors — 2026-09-13

This direction supersedes the neutral-dark appearance above. References are the user's character-gallery screenshot (`codex-clipboard-127d3887-1080-4463-b6df-ebe6e1983c38.png`) and character-detail screenshot (`codex-clipboard-f1331586-045d-42e5-8a56-157c0b34bb98.png`). Both source images and corresponding final model/wallet captures were opened together for comparison. The objective is translation of the supplied materials and color hierarchy to the existing API product, not a pixel clone of a game or new character/upgrade functionality.

### Design comparison

- Source gallery: native bright cyan, lime, lemon and purple product faces with a diagonal sheen, and a separate quiet information base. The four exact backdrop PNGs are imported without recoloring; model cards use them by provider, with navy price seats and independent savings badges. Original inventory is now 431 assets. Long prices remain whole; units may wrap independently.
- Source detail: subdued navy information containers, distinct cyan selection and green state/action colors, and original colorful icons. The wallet combines mint balance, lemon consumption, cyan requests/amount choices, lavender referral and navy recharge/quote containers. Alipay and WeChat retain separate blue and green controls.
- Keys use cyan cards, mint recent records, navy details, lavender utility actions, cyan copy and white-on-red destructive actions. The dialog retains the original window silhouette, arched cap, key emblem and footer. Key value/copy alignment and source nine-slice geometry are preserved.
- Typography remains the existing Rubik/CJK stack; no copy, fields, prices, grouping, permissions, payment handlers or navigation destinations were changed in this pass. Text uses dark ink on bright materials and light ink on recessed seats. Provider/user identity imagery is retained.

### Browser coverage and corrections

Local evidence: `../../.artifacts/bright-demo-qa/`. Final files have `-final` where an initial capture exposed a defect. Desktop 1280×720: keys, creation window, wallet, both Anthropic and OpenAI model materials, profile, usage, logs and representative system-info settings. Mobile 390×844: model grid, creation dialog and wallet. No horizontal page overflow in checked key/model views; the mobile dialog retains body scrolling and two aligned 149×44px footer controls.

The comparison caught and corrected old high-specificity gray account frames hiding the new balance/profile paint, insufficient contrast on inset labels and inactive model tabs, split price digits, and a temporary stylesheet asset-path build error. Logs' actual record wrapper now uses the original navy table art. Final browser checks confirmed the wallet balance has no nested gray frame, the recharge frame uses `info-seat.svg`, and the original native record-table image is actually rendered. No remaining P0/P1/P2 findings in this reviewed scope.

Interactions checked without creating data: Dock navigation; vendor filtering between Anthropic and OpenAI; model-card detail selection retained; create-key open/cancel; mobile field focus and dialog scrolling. Disabled pagination remains visibly disabled. No keys were revealed/created, payments made, settings saved or cloud state changed. The temporary viewport override is reset after review.

### Verification and limits

Typecheck passed; 110 frontend tests passed across 24 files, including 14 import/provenance/paint/contrast checks. Named changed-source lint and formatting passed. Production build passed. Generated paint adapters are deterministic, preserve original PNG bytes/alpha/slice geometry and only expose opt-in role variables; they do not recolor a route globally. Native product primary ink also passed an offline pixel-envelope check under pressed-state image dimming (at least 5.20:1 for the four sources).

This is representative component-level visual QA, not a claim to have executed every rare administrator dialog or certified all of HIG/WCAG. The original public website and all pre-existing backend work remain untouched by this color pass. No commit, push or deployment was performed.

Final result: passed for the reviewed bright-component scope; ready for local user testing.

## Hierarchy rebuild after the user's color-clash rejection — 2026-09-13

The user rejected the bright-component result above with the profile screenshot
`codex-clipboard-68207d18-c2cc-43d2-aad1-728c82bad1c4.png`. That rejection
supersedes its visual acceptance. The two supplied Unity gallery/detail images
remain the authority: bright product faces and meaningful actions sit alongside
quiet information supports, not saturated parent-and-child panels.

### Implemented correction

- Profile now has a compact identity/metrics strip and separate account-control
  columns. Full lavender identity, cyan binding and mint notification surfaces
  are gone. The original navy information frame carries readable light text;
  currency, binding state and selected controls retain small semantic accents.
- Model identity uses bounded original vendor-colored faces; prices and the
  inline inspector use quiet source frames. Key cards use an original key emblem
  and small state indicators instead of filling whole cards cyan or mint.
- Wallet balance, recharge and referral have quiet source-backed supports,
  original coin/gift artwork, blue/green payment choices and a bounded referral
  action. Mobile order is balance, recharge, referral, then available plans.
- Shared secondary controls and Dock tiles use a source-preserving utility
  adapter with light labels. Original colorful icons remain intact. Primary and
  destructive actions remain distinct. The original flat-button slice geometry
  fixes the previously broken-looking ghost-control corners.
- Log type/state text uses readable semantic ink, and the actual split-scroll
  table uses the original navy table artwork. Binding-card excess spacing was
  removed.

### Evidence and review

Local screenshots in `../../.artifacts/hierarchy-redesign/` cover desktop profile,
wallet, model cards/inline details, keys, key creation, logs, loaded zero-state
usage and representative system settings. Mobile screenshots cover profile,
wallet, model cards, keys and the key-creation window. Final profile captures at
1440, 1020 (the user's actual width) and 390 pixels also live in the repository's
`../../.impeccable/review/` directory. These are viewport captures of the app's
internal scrolling layout, not claims of full-page coverage.

The independent finish reviewer accepted the source-reference hierarchy and
requested two responsive fixes: a balance digit wrapping at 1020px, and the
language explanation being truncated. Monetary values now remain whole and the
statistics move to their own row before the horizontal composition becomes too
narrow. The language selector responds to its card's width and the original
sentence is no longer clamped. The reviewer scored both fixes **resolved** from
fresh captures and returned **ship at the reviewed scope**. That verdict is not
a certification of unshown mobile settings or rare administration flows.

### Checks and boundaries

- All 110 frontend tests across 24 files passed after the final correction.
- Frontend typecheck, scoped changed-source lint/format checks and production
  build passed.
- All 40 semantic and 41 neutral/source-preserving paint adapters passed their
  reproducibility checks. Original PNG payloads and source geometry are covered
  by the asset regression suite. The utility adapter preserves embedded pixels
  and alpha and audits its light labels across interaction states.
- The single design-detector pass produced advisory token/type/radius
  documentation observations only; it was not rerun to manufacture a clean
  result. Design documentation is updated to record the corrected hierarchy.
- No keys were created, revealed or copied; no payments or settings were
  submitted. Existing business logic, source translations, backend work and the
  original public website were not changed by this redesign.

Final result: passed for this review's captured scope and its two resolved
responsive findings. Local user testing only; no commit, push or deployment.

## Name-first API key inventory card — 2026-09-13

### Visual authority and scope

The user rejected the oversized key illustration and explicitly requested the
Key name in the blue region. Three independent built-in ImageGen studies were
displayed; under the user's instruction to choose, the third compact title-banner
study was selected. Source: `../../.artifacts/key-nameplate-redesign/selected-concept.png`
(1619×971 pixels, including presentation padding). It is a layout study, not a
shipping raster. Original Unity PNGs, fonts, masked credentials and billing
behavior remain authoritative. Only inventory cards changed.

### Evidence and fidelity

Implementation: `http://127.0.0.1:5173/keys`. Captures in
`../../.artifacts/key-nameplate-redesign/`: `desktop.png` (1440×1000),
`user-1020.png` (1020×927), and `mobile.png` (390×844). Capture pixels match CSS
viewport dimensions. The source and 1020px implementation were opened together
in one comparison input. Comparison is of the card region and its hierarchy,
not the image's decorative outer canvas: the source is a magnified concept,
whereas the implementation fits real responsive cards (357×216 at desktop).
No claim of pixel-identical raster reconstruction is made. The source's invented
lighting and shortened masking are intentionally not copied over real assets/data.

- Typography: 26px bold name in the blue banner, 32px subordinate original icon;
  existing Rubik/CJK family retained. Masked identifier is 13px monospace, status
  12px, quota 18px. Names lead instead of the key illustration.
- Layout: 88px minimum banner, 216px minimum card, grouped token/status row and
  bottom inset ledger. Menu keeps its separate 44px target. No visible overlap,
  clipped amounts or horizontal card overflow in the three captured sizes.
- Colors: existing dark info ink on the original blue face; existing quiet frame
  and light data text below. State color is confined to the actual status dot.
  Source sprite shades intentionally take precedence over ImageGen shading.
- Images: original blue backdrop, inset, frame and gold/silver key are reused.
  No generated screenshot, new fake icon, invented level or decorative progress
  is shipped. A browser clip attempt was malformed and saved as
  `unusable-browser-clip.png`; it is excluded from acceptance evidence. The valid
  1020px capture exposes all card details legibly for the focused comparison.
- Content: names, masked tokens, used quota and status labels remain real.
  Unlimited quota has no fabricated progress bar; finite quota keeps its meter.

### Verification and disposition

The first implemented comparison found no actionable P0/P1/P2 issue; no visual
fix loop was required. A separate read-only reviewer returned `ship` for the
card scope after reviewing the concept and the three current captures. Actual
card selection changed the inline inspector from Dot-4 to Dot-3, including its
name and masked token. Captured browser error logs were empty. No keys were
revealed, copied, created or modified, and no settings/payment requests were made.

All 114 frontend tests across 25 files passed, including four inventory-card
regressions. Typecheck, scoped lint, production build and whitespace checks
passed. A single layout-detector pass returned no findings. Rare/localized/long
name states retain wrapping in source but were not exhaustively browser-tested.

Implementation checklist: name-first banner complete; original assets retained;
responsive captures reviewed; selection verified; local preview kept running.
No commit, push or deployment.

final result: passed

## Create-key game window — 2026-09-13

### Scope and visual hierarchy

The requested change is limited to the create-key dialog. The inventory cards,
edit-key composition, backend, defaults and submission behavior remain unchanged.
Original Unity arched window, cap, footer, recessed inputs and inset panels are
retained. The blue name field is the first visual anchor; quota and expiry form
a desktop pair, followed by models, IP access and the existing advanced section.
Small original semantic icons replace no labels. Cancel and create retain equal
widths and 48px targets. The subtitle remains available to assistive technology.

### Captured evidence and corrections

Local route: `http://127.0.0.1:5173/keys`. Evidence is in
`../../.artifacts/key-create-redesign/`: `before.png` (1280×720),
`desktop.png` (1440×1000), and `mobile.png`, `mobile-date.png`,
`mobile-advanced.png` (390×844). The mobile captures show different scroll and
form states, not three complete views of all content at once.

The first browser pass exposed composed FormControl slots bypassing the input
skin. Scoped selectors now cover those slots and the combobox's actual inner
input. A legacy green quota inset was removed from this composition, the name
input measures 52px, and the IP textarea measures 72px. The mobile date control's
flex basis was corrected so date, time and Clear fit together. No horizontal
form overflow was measured; mobile footer actions measured 157×48px each.

Date presets, enabling finite quota, expanding advanced quantity and scrolling
to the final help text were exercised without submitting. Cancel/reopen restored
the existing empty name, unlimited quota, no expiry and unrestricted-model
defaults. Escape closed the dialog. Captured browser error logs were empty.

### Verification and disposition

All 114 frontend tests across 25 files passed. Frontend typecheck, scoped lint,
format, whitespace checks and the final production build passed. One layout
detector pass returned no findings. A separate read-only finish review returned
`ship` after reviewing the current source and desktop/mobile evidence, with no
substantive remaining issue in the reviewed scope.

No key was created, revealed or copied; no settings or payment was submitted.
Actual server-side creation and every locale/short-height permutation were not
retested because this change does not alter the submission contract. Local
preview remains running. No commit, push or deployment.

final result: passed for the captured and exercised scope

## Create-key selected ImageGen option 3 — 2026-09-13

### Visual authority and comparison

The user selected the third displayed generated result, saved as
`../../.artifacts/key-create-option3/reference.png`. This replaces the previous
creation layout above, not the key inventory cards or edit-key mode. Original
Unity source artwork, real translations, defaults and field behavior remain
hard constraints. No new generated sprite or game mechanic is shipped.

Source pixels: 1199×1312. Current `desktop.png` in the same folder is also
1199×1312 at a 1199×1312 CSS viewport (one screenshot pixel per CSS pixel).
The source presents an approximately 1060px-wide enlarged component, while the
real dialog is 820px wide and about 918px high. Comparison uses the component
regions at the width ratio 820/1060, not outer presentation padding or a claim
of pixel-identical reconstruction. Both images were opened together in the same
comparison input. The full-size component is legible, so a separate cropped
region was unnecessary; computed measurements supplement the alignment review.

Additional captures: `mobile.png`, `mobile-date.png`, `mobile-advanced.png`
(390×844 CSS and pixels), and `laptop.png` (1280×720 CSS and pixels). The mobile
captures represent top, selected-date and scrolled/advanced states. The laptop
capture retains the local time from an exercised date preset; the desktop
comparison is the untouched empty/default state.

### Findings and one correction batch

- Resolved P1: the blue name background was covered by the shared inset sprite,
  making dark name text unreadable. Initial evidence: `desktop-initial.png` and
  `mobile-initial.png`. Name is now excluded from the inset-material selector;
  computed border-image is `none` and the original blue source remains visible.
- Resolved P2: small-screen flex shrinking compressed the name row below its
  content. Direct form children no longer shrink; the final mobile capture
  shows the complete label and input within the blue face.
- Resolved P2: the icon sizing rule also enlarged the advanced chevron. Its
  explicit 16×16 dimensions now preserve the reference's subordinate affordance.

The post-fix desktop/source comparison and mobile captures confirm all three
corrections. No further actionable P0/P1/P2 difference was found.

### Required fidelity surfaces

- Typography: existing Unity Rubik with Noto Sans SC/PingFang fallback; title
  26px, primary field labels 17px, inputs 16px, helpers 13px. At mobile, labels
  reduce to 15px while input text stays readable. Live text is not rasterized.
- Layout: 820px dialog, 168px label rail, 20px column gap, 8px row rhythm and a
  100px name face. All five main controls start at x=417.5 in the desktop
  capture. Below 720px the rails become one column without changing DOM/focus
  order. Mobile buttons each measure 157×48; no horizontal form overflow.
- Color: original blue name face, navy supporting material and small semantic
  gold/lavender/cyan/mint icons match the reference hierarchy. Source artwork
  intentionally lacks the generated image's additional lighting and hairlines.
- Images: original window/cap/footer, input, inset, blue face and pictograms
  remain intact. The source pencil is rendered directly without inventing the
  mock's extra tile. This is an accepted original-asset constraint, not new art.
- Content: every field, helper and action retains its existing translations.
  Empty name, unlimited quota, no expiry and unrestricted models remain the
  defaults. No grouping selector, extra section, step or game stat was added.

### Interaction checks and disposition

Unlimited quota can be disabled and restores the existing finite amount;
the one-month preset updates the date and enables time/Clear. Advanced expands
to quantity and its full helper. Cancel/reopen resets the original defaults;
Escape closes the dialog. At 1280×720, form content scrolls, advanced remains
reachable and footer actions stay visible. Captured browser error logs are empty.
No key was created, revealed or copied and no settings/payment was submitted.

All 114 frontend tests across 25 files passed, as did typecheck, scoped lint,
format, whitespace and the final production build. The single layout-detector
pass returned no findings. An independent read-only finish reviewer returned
`ship` for the reference alignment, mobile layout and scoped change.

Residual coverage limits: actual server-side creation, every locale and every
validation/server-error combination were not browser-retested. The existing
submission/default transformations were not changed. Original sprite fidelity
is prioritized over ImageGen's invented pixel details.

Implementation checklist: selected-reference hierarchy complete; source artwork
retained; desktop/mobile/short-height checked; interactions preserved; local
preview running. No commit, push or deployment.

final result: passed

## Dock selected ImageGen option 2, drawn chrome — 2026-09-13

### Authority and scope

The user selected Dock study 2, rejected the initial texture approximation and
explicitly requested code-drawn chrome so future destinations can be added.
That instruction authorizes SVG/CSS drawing for this Dock only. The original
Unity icons remain independent assets; generated background studies are not
runtime assets. Routes, permission filtering, translations, the More menu and
the separate system-settings Dock were not changed.

### Reference comparison and iteration

Evidence: `../../.artifacts/dock-option2/`. The selected source is
`reference.png` (2172×724). `desktop-drawn.png` is the actual wallet page at
1280×800 CSS pixels and screenshot pixels, with Ledger selected and no hover,
menu or keyboard focus. `desktop-dock-final.png` isolates its Dock.

`comparison.png` presents the source above the implementation in the same
input, normalized to an approximately 800px tray width; presentation padding
is excluded. This is a component-scale comparison, not a claim that the full
mock and page have the same viewport or are pixel-identical. It was inspected
after the final changes. `mobile.png` and `mobile-menu.png` capture the 390×844
wallet page with the menu closed and open respectively.

- Replaced the rejected background approximation with a responsive SVG frame
  and separate selected seat. Multiple rim/depth layers preserve rounded
  endcaps as the tray expands; the seat has outward concave feet rather than a
  rectangular outline or ordinary rounded tile.
- Corrected the first drawn pass's small icons and label to 56px and 16px on
  desktop, and restrained the upper illumination to match the reference.
- Removed inherited mobile More-button margins, which caused unnecessary
  width. At 390px all eight targets fit: tray 364×76 at x=13, targets 44×54;
  neither the Dock viewport nor the document has horizontal overflow.
- Kept keyboard focus styling, but removed focus from the comparison state so
  the ordinary appearance is compared with the same source state.

### Required fidelity surfaces

- Typography: live translated label, current Rubik/Noto Sans SC stack,
  16px/600 on desktop and 12px on the smallest layout. Only the current route
  label is visually displayed; every destination retains its accessible name.
- Layout: compact 800×96 tray for the current eight desktop entries, evenly
  spaced original icons, raised selected seat and reserved bottom safe area.
  Width follows the actual item list; a dedicated horizontal overflow region
  accommodates additional entries without stretching the endcaps.
- Color/material: cool navy face, independently drawn lighter rim and darker
  lower extrusion, restrained upper highlight and a bright cyan selected
  surface. The source's concave-footed silhouette is visible in the comparison.
- Images: original Unity assets remain intact, including their own lighting
  and proportions. Differences from the generated mock's invented icon pixels
  are intentional; no generated tray bitmap or newly drawn icon was shipped.
- Copy: no new navigation name, number, badge, destination or game mechanic.
  All existing labels and route/permission behavior are preserved.

### Interaction and technical checks

Wallet-to-Keys navigation updated the selected icon, seat and label. More opened
by pointer and keyboard, retained the existing administrator destinations,
and closed with Escape; after exit its trigger regained focus. Under emulated
reduced motion, computed seat/icon transition duration is 0s. Emulation was
cleared afterward. Browser error/warning logs were empty.

Typecheck, scoped lint/format, whitespace checks and the final production build
passed. All 114 frontend tests across 25 files passed. No key, payment, account
setting or backend data was submitted. Extra future destinations were not
created merely for testing; expansion follows the existing flex item list and
viewport-relative frame dimensions. Every locale and older browser engine was
not separately exercised.

No actionable P0/P1/P2 issue remains in the captured desktop/mobile Dock scope.
Local preview remains running. No commit, push or deployment.

final result: passed

## 2026-09-13 — Usage logs, selected ImageGen option 1

### Reference and scope

The user selected the first generated composition. Reference:
`../../.artifacts/logs-option1/reference.png` (1586×992).
Direction: `.impeccable/usage-logs-brief.md`. This scope replaces the common
log page's old sidebar layout with a horizontal filter strip and type selector,
then contains its table and pagination in one ledger above the unchanged Dock.
Shared task/drawing ledgers receive the containment/header treatment, not new
features. Original labels, records, translations, role checks and billing
values remain authoritative over illustrative mock records.

### Comparison evidence

All evidence is under `../../.artifacts/logs-option1/`:

- `desktop.png`: final common logs at 1586×992.
- `comparison.png`: reference left / implementation right, same viewport.
- `detail-comparison.png`: paired filter/type/header/detail crop at native scale.
- `mobile.png`: 390×844, responsive record cards and contained pagination.
- `tablet.png`: 1024×768, wrapped search strip and table-only horizontal scroll.
- `advanced.png`, `mobile-filter.png`: expanded existing filter controls.
- `drawing-empty.png`: existing drawing route with empty results and pagination.

The first visual pass exposed an old black input skin and a more-specific
global badge rule. Both were corrected in one batch. The final comparison
shows the selected strip → types → ledger → footer order, compact header
controls, wrapped long details/usernames and restrained semantic badges. Unity
source pictograms and panel/input sprites are reused; no reference screenshot,
newly generated bitmap, or fabricated data is shipped. Body typography and
source lighting are denser/quieter than the mock, within the established Unity
identity. No main-document horizontal overflow was observed at tested widths.
At tablet width, the table scrolls internally (979px client / 1312px content);
the pagination ends at y639 and the Dock reserve starts at y640.

### Behavior and technical checks

- Mobile: filter drawer opens, fields scroll independently of its footer;
  searching a nonexistent model shows the existing no-results state, then
  Reset restores all 16 local records.
- Desktop: advanced filters expand/collapse; collapsed fields are inert and
  motion respects reduced-motion CSS. Type Management plus Search returns four
  matching records. Reset restores 16.
- A management record's Details button opens the existing request details;
  Return to logs closes it. More exposes column visibility, privacy control
  and usage/RPM/TPM statistics; all nine optional column checkboxes remain.
- Page size 10 enables Next, which loads page 2 with six records; restored 20.
- Task and drawing tabs remain reachable, with their existing filters, columns
  and no-results behavior. Their populated states were not available locally.
- Frontend typecheck, targeted lint, formatting, whitespace check and production
  build passed. All 114 tests across 25 files passed.
- Scoped text/background contrast calculations: body 10.42:1, secondary 6.62:1,
  and all seven semantic status label combinations at least 6.01:1. Existing
  source-based control label contrast remains covered by the semantic asset
  tests; focus and pressed-state hooks are retained.
- Browser diagnostics contained only the earlier, corrected development asset
  import/HMR errors; no subsequent runtime warning/error was recorded during
  these interaction checks. The initial bad CSS asset path was corrected to
  the bundler-resolved original public PNG.

The one detector pass had advisory-only scoped color/type/radius documentation
findings, no primary failures. A fresh read-only finish reviewer inspected all
desktop/mobile/tablet and paired evidence plus scoped code and returned
**ship**, with no material fix required. This is a bounded visual/code verdict,
not certification of every locale, extreme log payload, assistive technology,
or unrelated page. No live payment, key, account setting or database mutation
was performed. Local preview remains running; no commit, push or deployment.

final result: passed
