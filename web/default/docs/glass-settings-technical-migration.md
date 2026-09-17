# Technical settings: approved glass migration

## Scope and source of truth

This migration covers the 17 actual billing, model and security sections. It does not change the original public/embedded website. All reference images were generated separately **before** this family's styling changes, using the approved Keys screenshot at `.artifacts/glass-rollout/approved-keys.png`.

The existing application code is the authority for fields, labels, descriptions, actions, permissions, default values and conditional visibility. Generated screenshots are visual studies only. Where a generated image introduces an extra button, invents a label, masks an ordinary number or shows a different value, that content is not implemented.

Shared material tokens come from `src/styles/console-glass.css`: 2% white fill, 24px background blur, 80% white primary text and 60% white secondary text, with a 0.5px white highlight edge. No new feature, endpoint, billing rule, persistence mechanism or business copy was added.

## Per-page reference and implementation inventory

All image and prompt paths below are relative to the repository root. Each image has its own adjacent `.prompt.txt`, preserving the exact generation brief.

| Actual route | Generated demo | Existing source preserved | Layout applied |
| --- | --- | --- | --- |
| `/system-settings/billing/quota` | `.artifacts/glass-rollout/settings-billing-quota.png` | `general/quota-settings-section.tsx` | Balanced paired amount/link fields in a focused 1120px glass panel; invitation compliance notice and free-model switch remain. |
| `/system-settings/billing/currency` | `.artifacts/glass-rollout/settings-billing-currency.png` | `general/pricing-section.tsx` | 960px form with aligned display-mode/rate controls and full-width switches; custom currency and legacy fields retain their existing conditions. |
| `/system-settings/billing/model-pricing` | `.artifacts/glass-rollout/settings-billing-model-pricing.png` | `models/ratio-settings-card.tsx`, `model-ratio-visual-editor.tsx`, `model-pricing-sheet.tsx` | Shrinkable list/editor split, contained table scrolling, readable single-column price lanes, responsive preview grid. Model/tool/upstream-sync tabs and all pricing modes remain. |
| `/system-settings/billing/group-pricing` | `.artifacts/glass-rollout/settings-billing-group-pricing.png` | `models/group-ratio-form.tsx`, `group-ratio-visual-editor.tsx`, `group-special-usable-editor.tsx` | Quiet layered table panels and paired JSON editors; visual/JSON mode, routing-only conditions, group rules and guides remain. |
| `/system-settings/billing/payment` | `.artifacts/glass-rollout/settings-billing-payment.png` | `integrations/payment-settings-section.tsx` and provider children | All six provider tabs wrap into accessible pill controls instead of forcing a 44rem strip; webhook guidance uses the glass material. Compliance gating, fields and provider flows remain unchanged. |
| `/system-settings/billing/checkin` | `.artifacts/glass-rollout/settings-billing-checkin.png` | `general/checkin-settings-section.tsx` | Focused enable row plus paired minimum/maximum inputs; the existing enabled-only rendering and save validation remain. |
| `/system-settings/models/global` | `.artifacts/glass-rollout/settings-models-global.png` | `models/global-settings-card.tsx` | Blacklist and compatibility-policy editors placed alongside one another on desktop; passthrough, warning, examples, formatting and keep-alive controls retained. |
| `/system-settings/models/routing-reliability` | `.artifacts/glass-rollout/settings-models-routing-reliability.png` | `models/routing-reliability-section.tsx` | Distinct retry, health-check and automatic-disable groups with deliberate spacing and readable hierarchy; all existing operational controls remain. |
| `/system-settings/models/gemini` | `.artifacts/glass-rollout/settings-models-gemini.png` | `models/gemini-settings-card.tsx` | Paired configuration editors with adapter controls alongside the third editor at desktop widths; model lists and all toggles remain. |
| `/system-settings/models/claude` | `.artifacts/glass-rollout/settings-models-claude.png` | `models/claude-settings-card.tsx` | Header and default-token JSON editors share a row; thinking adapter and ratio remain grouped below. |
| `/system-settings/models/grok` | `.artifacts/glass-rollout/settings-models-grok.png` | `models/grok-settings-card.tsx` | Compact single-column control panel; disabled amount state and official documentation link preserved. |
| `/system-settings/models/channel-affinity` | `.artifacts/glass-rollout/settings-models-channel-affinity.png` | `general/channel-affinity/index.tsx` and dialogs | Aligned basic controls, readable switch rows and contained rules table; templates, visual/JSON modes, cache operations and confirmations remain. |
| `/system-settings/models/model-deployment` | `.artifacts/glass-rollout/settings-models-model-deployment.png` | `integrations/ionet-deployment-settings-section.tsx` | Focused deployment setup panel with wrapping API-key/test row on mobile; enable-dependent controls, connection test and instructions retained. |
| `/system-settings/security/rate-limit` | `.artifacts/glass-rollout/settings-security-rate-limit.png` | `request-limits/rate-limit-section.tsx`, `rate-limit-visual-editor.tsx` | Three metric controls above a full-width group-limit editor in both visual and JSON modes; groups, validation, units and help remain. |
| `/system-settings/security/sensitive-words` | `.artifacts/glass-rollout/settings-security-sensitive-words.png` | `request-limits/sensitive-words-section.tsx` | Two clear switch rows and a large editing area within a 1080px glass panel; scan behavior and all text retained. |
| `/system-settings/security/ssrf` | `.artifacts/glass-rollout/settings-security-ssrf.png` | `request-limits/ssrf-section.tsx` | Domain/IP mode-and-list pairs use desktop columns; enable/private-IP/resolution switches and port field remain present with unchanged behavior. |
| `/system-settings/security/token-limits` | `.artifacts/glass-rollout/settings-security-token-limits.png` | `request-limits/token-limit-section.tsx` | Focused 800px single-field settings object, not a stretched empty grid; existing maximum constraint, help and save remain. |

Source paths in the third column are relative to `web/default/src/features/system-settings/`.

## Files changed

- `src/styles/glass-settings-technical.css`: family-scoped material/layout rules and individual section refinements.
- `models/global-settings-card.tsx`: two semantic styling classes.
- `models/routing-reliability-section.tsx`: styling classes on the three existing operational groups.
- `models/model-ratio-visual-editor.tsx`: styling classes on existing split-pane elements.
- `models/model-pricing-sheet.tsx`: styling classes on the existing editor and lane/preview layout.
- `integrations/payment-settings-section.tsx`: styling classes on existing provider tabs and guidance blocks.
- `request-limits/rate-limit-section.tsx`: styling class making the existing group editor full width in either mode.

The initial TypeScript diff contained only `className` changes. A subsequent scoped lint cleanup replaced equivalent nested ternaries with branches, changed the type-only table import, removed a non-null assertion through a guard, and used the equivalent `Number.parseInt`/`Number.parseFloat` APIs. No control was removed, no text changed, and no options, defaults or API requests were modified.

## Responsive and accessibility decisions

- Technical setting content stays within the main console's scrolling region. No controls are hidden to force dense forms into a single fixed viewport.
- The pricing editor previously had an unconditional 720px minimum height and 400px nested field columns. The new scoped layout lets columns shrink and keeps its existing scroll containers, selection, pagination and mobile Sheet behavior.
- At tablet widths the pricing list and inline editor stack. At the existing mobile breakpoint the original mobile Sheet continues to handle editing.
- Payment providers wrap; all six remain visible and keyboard-operable. Existing tabs semantics and active state are untouched.
- Fields keep existing labels, descriptions, validation messages and associations. Numeric content uses tabular figures; JSON retains monospace.
- Existing destructive alerts and switch states retain semantic colors. Shared focus and reduced-transparency/contrast behavior are inherited from the console foundation.
- The mobile pricing Sheet portal is scoped with `html:root:has(...)` to the active glass model-pricing route so its internal column fix also applies outside the route DOM subtree.

## Validation

- All 17 demo PNG files and adjacent prompt files were confirmed present before implementation.
- `bun run typecheck`: passed after the layout changes.
- `oxfmt` on the new stylesheet: passed.
- LightningCSS parsing of the new stylesheet and scoped `git diff --check`: passed.
- Targeted lint of all six touched leaf files: passed after the equivalent cleanup, with no errors or warnings.
- Related existing tests: 23 passed across six files (`routing-groups`, `system-settings-dock`, `price-summary`, `channel-prices`, `cny-payment-api`, and `payment-amount`). These protect settings navigation, routing-group controls, original/discounted prices, unit conversion and payment amount contracts.
- The snapshot merger retains saved/draft precedence and filtering; the new missing-snapshot guard cannot be reached for names taken from those same two maps. Pricing-mode precedence remains expression, then nonempty fixed price, then per-token.
- First integrated screenshot review found a transparent sticky action column overlapping model prices, legacy sprite fills inside table wrappers/empty editor, and a wrapping rate-limit unit plus colliding search icon. The second scoped CSS pass removes those sprite fills for both shared and raw tables, scrolls all model columns together, preserves unit text as a non-shrinking suffix, and reserves search-icon spacing. No field or action is hidden.
- Layout detector after that corrective pass: no findings. Confirmation screenshots are owned by the root agent.
- Integrated browser QA is owned by the root agent. Highest-risk visual checks: model pricing at desktop/tablet/mobile widths, provider tab wrapping, visual/JSON rate-limit switching, custom-currency conditional fields, and disabled deployment/check-in states.

Status: implementation and static checks complete; integrated browser verification pending.
