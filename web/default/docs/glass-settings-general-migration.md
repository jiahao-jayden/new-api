# General system settings — glass migration

## Scope and implementation contract

This pass covers the 23 existing `site`, `auth`, `operations` and `content` system-settings routes. It changes composition and material only, using `src/styles/glass-settings-general.css`.

The source of truth remains each family's `section-registry.tsx` and its existing section component. No leaf component, form schema, default value, API call, action, wording, visibility condition, role check, or route is changed by this pass. Existing module-selection configuration remains available to the same administrators. Existing destructive maintenance controls retain their confirmations and permissions. Public website files are untouched.

The shared settings wrapper supplies `data-settings-family` and `data-settings-section`. Import this stylesheet **after** `console-glass.css` and legacy game styles. All rules are scoped beneath `html:root [data-console-skin='glass']` and the four owned family attributes; they do not apply to billing/model settings, other pages, or the original website.

Shared material dependencies:

- `--console-glass-fill`: white at 2% opacity.
- `--console-glass-blur`: `blur(24px)` through a custom property, retained by the frontend CSS pipeline.
- `--console-glass-text` / `--console-glass-muted`: white at 80% / 60% opacity.
- `--console-glass-edge`: the approved directional white edge gradient.
- Shared controls, menus, dialogs, status feedback, floating header and bottom Dock are owned by `console-glass.css` and the console shell.

The form surface has one thin, aligned 0.5px highlight. Related fields are separated by whitespace rather than multiple sprite panels. Single-line inputs and actions use shared pill controls. Long forms keep all fields accessible by the console's scroll region; content tables retain native horizontal scrolling when the viewport cannot contain every existing column.

## Demo provenance and prompt brief

Every route below received a separate built-in image-generation request **before** its page-family implementation. All 23 images were inspected. The common style reference was `.artifacts/glass-rollout/approved-keys.png`, which was inspected before generation. These are local design references, not production page assets.

Common prompt brief (summary, not a claimed verbatim transcript): create one polished 1440×1000 administrator settings screen; retain the approved Keys nebula wallpaper, disconnected floating header islands, low black organic Dock, monochrome line icons, restrained 2% white frosted-glass surfaces, 24px blur, 0.5px white edge highlights, 80% primary / 60% secondary white text and pill controls. Render the route's real form or table fields with safe demonstration values and masked secrets. Do not copy Keys content, use game sprites, create a sidebar, invent metrics, or add product functionality.

Per-page content directives are summarized in the inventory below. The final four image requests also have verbatim prompt sidecars: `settings-content-api-info.prompt.txt`, `settings-content-faq.prompt.txt`, `settings-content-chat.prompt.txt` and `settings-content-drawing.prompt.txt`, alongside their PNG files. Earlier requests predate a turn interruption; their prompt briefs are recorded here rather than presenting reconstructed text as an exact transcript.

Some image outputs nevertheless invented supplemental controls, left navigation or descriptions. Those hallucinated elements were deliberately **not implemented**. In particular, the actual notice page remains its existing editor without an invented preview/enable function, and system maintenance keeps its existing version, uptime and update-check functionality without invented restart/cache tools. Materials and spacing can inform implementation; generated content cannot override the source-code feature inventory.

All demo paths in the inventory are relative to the repository root and start with `.artifacts/glass-rollout/`. Registry paths are relative to `web/default/src/features/system-settings/`. The generated-image source directory is `/Users/dax/.codex/generated_images/01a0aa9e-3f6a-7061-b828-a78cd7ce14c5/`.

## Per-page coverage

| Existing route                               | Preserved fields / content used in its prompt                                                                       | Applied composition                                                                                                                      | Saved demo                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `/system-settings/site/system-info`          | Frontend theme, system name, server address, logo, footer, about, homepage content, agreement, privacy policy       | Short fields and ordinary editors share a spacious two-column desktop form; the explicitly full-width homepage editor remains full width | `settings-site-system-info.png`          |
| `/system-settings/site/notice`               | Existing announcement-content editor and save action                                                                | Focused long-form editor with a larger responsive text area, without added sections                                                      | `settings-site-notice.png`               |
| `/system-settings/site/header-navigation`    | Existing simple-module enabled controls and access-module enabled / authentication requirements                     | Paired groups with whitespace-based dependent-control hierarchy                                                                          | `settings-site-header-navigation.png`    |
| `/system-settings/site/sidebar-modules`      | Every existing category enabled control and child-module toggle                                                     | Two category columns on desktop; readable single-column controls within each category, no nested sprite frames                           | `settings-site-sidebar-modules.png`      |
| `/system-settings/auth/basic-auth`           | Password login, registration, password registration, email verification, domain/alias restriction, domain whitelist | Two-column toggle rhythm on desktop, full-width whitelist editor                                                                         | `settings-auth-basic-auth.png`           |
| `/system-settings/auth/oauth`                | GitHub, Discord, OIDC, Telegram, LinuxDO and WeChat tabs with their existing provider-specific fields               | Scrollable pill provider tabs at narrow widths; aligned form fields and unchanged provider switching                                     | `settings-auth-oauth.png`                |
| `/system-settings/auth/passkey`              | Enable, RP display name, RP ID, origins, insecure-origin permission, verification and attachment preference         | Balanced two-column credential/preferences form using the common glass surface                                                           | `settings-auth-passkey.png`              |
| `/system-settings/auth/bot-protection`       | Turnstile enabled, site key and secret key                                                                          | Focused-width form; all existing credentials and actions retained                                                                        | `settings-auth-bot-protection.png`       |
| `/system-settings/auth/custom-oauth`         | Provider icon, name, slug, state, client ID, actions, add/editor/delete dialogs                                     | Airier rows and readable table overflow; dialogs retain the shared skin and existing logic                                               | `settings-auth-custom-oauth.png`         |
| `/system-settings/operations/behavior`       | Default sidebar collapse, demo-site and self-use toggles                                                            | Focused utility form; configuration semantics are unchanged despite the current Dock shell                                               | `settings-operations-behavior.png`       |
| `/system-settings/operations/alerts`         | Quota threshold, performance metrics enabled, flush interval, bucket granularity, retention                         | Clear field rhythm, comfortable numeric inputs and preserved dependency states                                                           | `settings-operations-alerts.png`         |
| `/system-settings/operations/email`          | SMTP server, port, account, sender, token, SSL, STARTTLS, certificate verification and authentication mode          | Credential grid plus paired desktop security switches; secrets remain handled by existing controls                                       | `settings-operations-email.png`          |
| `/system-settings/operations/worker`         | Worker URL, validation key and HTTP image request permission                                                        | Compact, focused proxy form without extra diagnostic controls                                                                            | `settings-operations-worker.png`         |
| `/system-settings/operations/logs`           | Consumption-log enablement, historical cleanup, date/progress, server-log mode/retention/status/table/actions       | Existing maintenance groups separated by spacing; destructive actions and confirmations remain intact                                    | `settings-operations-logs.png`           |
| `/system-settings/operations/performance`    | Disk cache enable/threshold/size/path, monitoring enable/thresholds, existing runtime monitoring output             | Long-form settings with a separate breathing space before existing runtime information                                                   | `settings-operations-performance.png`    |
| `/system-settings/operations/update-checker` | Version, uptime, update-check action and existing release dialog                                                    | Compact maintenance surface with clearer tabular-number readouts; no invented operations                                                 | `settings-operations-update-checker.png` |
| `/system-settings/content/dashboard`         | Export enablement, interval and default granularity                                                                 | Focused settings form without adding a dashboard chart                                                                                   | `settings-content-dashboard.png`         |
| `/system-settings/content/announcements`     | Enable/add/delete/save; selection, content, date, type, extra text and actions                                      | Distinct action row, legible existing table and shared editor dialogs                                                                    | `settings-content-announcements.png`     |
| `/system-settings/content/api-info`          | Enable/add/delete/save; selection, URL, route, description, color and actions                                       | Comfortable table row density with full column access and unchanged editors                                                              | `settings-content-api-info.png`          |
| `/system-settings/content/faq`               | Enable/add/delete/save; selection, question, answer and actions                                                     | Readable text-heavy rows and shared dialog treatment                                                                                     | `settings-content-faq.png`               |
| `/system-settings/content/uptime-kuma`       | Enable/add/delete/save; selection, category, URL, slug and actions                                                  | Aligned integration table and unchanged category editor                                                                                  | `settings-content-uptime-kuma.png`       |
| `/system-settings/content/chat`              | Visual/JSON tabs, client name, URL, actions, add-client and save                                                    | Compact pill mode selector, table for visual editing, spacious monospace JSON editor                                                     | `settings-content-chat.png`              |
| `/system-settings/content/drawing`           | The six existing drawing/Midjourney feature toggles                                                                 | Focused toggle stack with predictable spacing; no new drawing controls                                                                   | `settings-content-drawing.png`           |

## Verification and handoff

- Confirmed all 23 route IDs against the four current registries.
- Confirmed 23 distinct PNG artifacts exist; previously completed images were recovered rather than regenerated after interruption.
- Inspected all 23 generated references, including the four completed after recovery.
- `bunx oxfmt src/styles/glass-settings-general.css`: passed.
- `git diff --check`: passed.
- `bun run typecheck`: passed (2026-09-16).
- This stylesheet contains no feature-hiding `display: none`, visibility overrides, form-state mutations, or copy changes.
- The parent agent captured all 23 live routes at 1280 × 720 in `.artifacts/glass-rollout/qa-settings-{family}-{section}.png`; every screenshot was visually inspected in this delegated pass. The parent reported that every route finished loading and had no root horizontal overflow.
- The first visual pass found and corrected material-specific misses: `FormControl` replaces primitive slots, so actual inputs/textareas and switch roles also need coverage; nested module frames, content tables and system-maintenance readouts still used Unity sprites. The corrections preserve controls, columns, values and state handling.
- Chat presets' search icon overlapped the text after shared input padding. Its existing reserved icon space and vertical alignment are now restored without changing the search control.
- **Follow-up screenshots for these CSS corrections remain pending.** The initial route/DOM pass is complete; this document does not yet claim the corrected rendering or a production-build pass.

Recommended browser checks after importing the stylesheet:

1. System Information: every editor and page-header save/reset action remains reachable; homepage full span is retained.
2. OAuth: all six providers remain accessible at desktop and narrow widths; credential reveal and tabs keep existing behavior.
3. Sidebar modules: category enablement and all dependent controls remain visible and accurately disabled when required.
4. Performance and Log Maintenance: long-page scrolling, operational statistics, tables, cleanup dialogs and danger feedback remain unobscured by the Dock.
5. Custom OAuth and content tables: horizontal scrolling exposes the last action column; existing add/edit/delete dialogs share the glass material without clipping.
6. Notice, Bot Protection, Worker and Drawing: compact forms do not become unnecessary full-height blocks; labels and controls remain aligned.
7. Reduced transparency and keyboard focus: confirm the shared accessibility overrides remain effective, and verify focus is distinguishable on the bright part of the wallpaper.

## Overlay interiors

`src/styles/glass-overlays.css` extends the already-generated `components-demo.png` / approved Keys material to portal interiors. It is scoped to the active glass console and existing dialog, alert-dialog, sheet, drawer and log-detail roots, explicitly excluding the original website.

The sheet removes Unity border images and the legacy floating decorative key; it does not remove real buttons or fields. Key name/quota/expiry/model/access groups keep their original layout. Native fields use 2% white fill, thin white highlights and shared blur. Error/destructive ink is preserved, while neutral text follows the 80% / 60% white system. Shared checkbox/radio SVG indicators remain the only selection markers, and absolute-positioned close buttons retain their positioning.

Pending overlay checks: Key creation and editing, advanced settings, a populated admin drawer and its error/disabled states. These must be checked by opening existing interfaces without submitting forms or modifying data.

No browser session, local data, remote service, Git commit or deployment was changed by this delegated pass.
