# Glass management migration

Date: 2026-09-16

## Design source and boundaries

The approved Keys page supplies the material, not the earlier game interface:
white at 2% opacity, 24px background blur, a 0.5px alpha-white conic edge,
80% white primary text, 60% white secondary text, and pill controls. The
existing wallpaper, floating header and Dock are supplied by the console
shell. No extra wallpaper, grain, opaque card fill, game sprite or fabricated
dashboard metric is introduced here.

Before this implementation, the parent task independently generated a demo for
each screen below. All nine images were inspected alongside the corresponding
React source. They are visual references only: actual columns, permissions,
selection behavior, pagination, filters, forms, existing explanatory text,
validation, refresh behavior and actions remain defined by the current code.

| Screen             | Generated reference                                    | Source review and applied treatment                                                                                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Channels           | `.artifacts/glass-rollout/channels-demo.png`           | Existing table/card toggle, groups, sensitive-data mask, row actions, balance refresh and priority/weight spinners retained. Table gets the shared glass edge; bespoke channel cards lose remaining sprite material. Stepper stays one compact control rather than three nested glass buttons.     |
| Users              | `.artifacts/glass-rollout/users-demo.png`              | Actual filters, admin capabilities, selection, disabled-row presentation and all columns retained. Shared table treatment is sufficient; no bespoke user card or invented statistics added. Existing editor sections lose their Unity border image.                                                |
| Redemption codes   | `.artifacts/glass-rollout/redemption-codes-demo.png`   | Existing code data, status filters, creation/edit form, bulk actions and pagination retained. Shared management ledger and existing pill controls reused.                                                                                                                                          |
| Subscriptions      | `.artifacts/glass-rollout/subscriptions-demo.png`      | Existing plan columns and actions retained, including current payment-related information. Demo-only tabs or columns were not added. Drawer fields and switches keep their existing flows.                                                                                                         |
| Model metadata     | `.artifacts/glass-rollout/models-metadata-demo.png`    | Existing metadata/deployment tabs, vendor filters, synchronization, model editor and actual columns retained. Glass ledger and tab spacing applied without adding demo fields.                                                                                                                     |
| Model deployments  | `.artifacts/glass-rollout/models-deployments-demo.png` | Real configuration-checking, disabled-service and connection-error states are styled as a focused glass panel. Successful connection still renders the original deployment table. No dummy deployment list replaces an unavailable service.                                                        |
| System information | `.artifacts/glass-rollout/system-info-demo.png`        | Instance telemetry, resource rings, node/role/version data, auto-refresh, active tasks and task history remain intact. Two glass sections replace opaque panels; inner table frames and decorative icon squares removed, while every existing label and description remains.                       |
| Drawing logs       | `.artifacts/glass-rollout/logs-drawing-demo.png`       | Actual date, drawing-task identifier and admin-only channel filters retained. Existing View links remain links: the demo's invented thumbnail column was not added. Filter actions are aligned alongside fields at wide widths; ledger scroll and pagination remain unchanged.                     |
| Task logs          | `.artifacts/glass-rollout/logs-task-demo.png`          | Actual date, task identifier and admin-only channel filters retained. Existing status, progress text, timing and detail interactions remain as-is; demo-only progress bars or filters were not introduced. Shares category-scoped glass treatment with drawing logs, without changing common logs. |

## Files and integration

- Import `src/styles/glass-management.css` after `glass-pages.css`. The parent
  task owns the shared import list and console shell.
- Six management `DataTablePage` instances receive only the
  `glass-management-table` class marker.
- Model management, three deployment state wrappers and the System Info
  wrapper receive pure styling class markers.
- Existing category attributes distinguish drawing/task logs; no log component
  changes are needed.
- Portaled editor overrides are restricted to the existing channel/user/
  redemption/subscription/model forms and channel usage dialog. The original
  public website is explicitly excluded.

## Verification

- TypeScript: passed.
- Formatting of all changed files: passed.
- `git diff --check`: passed.
- Static Impeccable check for the new stylesheet and changed state/section
  wrappers: no primary findings.
- Targeted lint passed for seven changed React files. Two untouched expressions
  in other files trigger existing rules: nested ternary in `users-table.tsx`,
  and a single-child Fragment in `deployment-access-guard.tsx`. Their original
  behavior was initially left intact because this assignment is visual-only.
- Browser QA: pending parent task's shared live-browser inspection. This
  source-only review does not claim a rendered visual pass.

No credentials, database records, payments, channel settings, deployments or
cloud state were changed.
