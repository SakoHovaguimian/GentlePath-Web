# Verification And Release Checks

Use static checks, builds, and focused local demo workflows. Do not write tests or run Xcode builds unless the latter is explicitly requested. Do not use live backend/provider writes, analytics, or notification permission prompts as routine verification.

## Required Checks

| Change                  | Verify                                                              |
| ----------------------- | ------------------------------------------------------------------- |
| Documentation only      | Referenced paths/anchors, Markdown/formatting, `git diff --check`   |
| Web source              | `npm run check`                                                     |
| Application behavior/UI | Also `DEMO_MODE=true npm run build` and affected browser/HTTP flows |
| Sibling API TypeScript  | Its `npm run check`, `npm run build`, and `git diff --check`        |
| Prisma schema/config    | Also its `npm run validate`; inspect migration separately           |

`check` includes zero-warning ESLint, route types/TypeScript, Next editor diagnostics, centralized strings/casing, semantic colors, shared-control ownership, and Tailwind canonical classes. Use actual package scripts; do not invent a test command. A demo build is not a deployment or live integration check.

## Manual Workflow Matrix

| Area                  | Required Evidence When Affected                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Navigation            | List/detail return, Back/Forward, filters/paging, modified links, unsaved leave/cancel                                       |
| Forms and data        | Validation focus, create/edit/remove, duplicate-submit prevention, retained input/retry, stale/conflict behavior             |
| Ownership and roles   | Own versus foreign records; User/Admin/SuperAdmin boundaries; no staff private-data override                                 |
| Controls and layers   | Keyboard/typeahead, long-option open popup, viewport collision/scrolling, nested Escape, safe confirmation focus/restoration |
| Layout and motion     | Desktop and 390px layout, long content, light/dark, device/saved reduced motion, stable busy states                          |
| Counts and visibility | Authoritative aggregates, save/like/vote/read state, deletion/hidden-parent propagation, correct scoped pagination           |
| Runtime               | Populated/Empty/finite Loading/503 recovery, demo isolation, account cleanup/reset boundaries                                |

Use fictional records in an isolated demo where possible. Remove synthetic records, stop only owned preview processes, restore changed settings/viewport, and leave user-owned previews alone. Server memory/reset is shared across every browser using that process.

## Supplemental UI Audit

`premium-ui.json` points to [the canonical UI map](UI_SYSTEM.md#canonical-ui-map) and this verification guide. Run the relevant skill audit when applicable, but inspect findings against actual shared owners. The regex scanner can misread authored Select/TextArea, composed Button links, or prop forwarding; broad scans can stall parsing a large source file. Record the actual bounded result and do not claim a clean audit when it did not complete. Do not weaken project checks or duplicate controls to satisfy a false positive. Browser evidence remains necessary.

## Live Release Boundary

Before claiming live readiness, verify configured staging for Firebase provisioning/refresh/roles, backend ownership and transactions, private/public storage and signed downloads, operator allowlist, socket tickets/broadcasts, push/email delivery/cleanup, consent, commercial serving/aggregation, and embedded-provider playback. Current local demo checks do not establish these integrations.

Deploy/check the API's structured-blog and tag-normalization migrations against the intended database through its normal release process. A TypeScript/Prisma validation command does not apply or execute migration SQL. Do not run database deploy/reset/seed as generic verification. [Integrations](INTEGRATIONS.md) records the retained portal/platform wiring gaps.

Keep this guide and the compact current evidence below up to date; do not append an implementation diary or historical build transcript.

## Current Evidence — October 29, 2026

- Web `npm run check` and `DEMO_MODE=true npm run build` passed after the UI and authentication redirect changes, including conditional destructive styling for platform availability changes. API `npm run check` and `npm run build` passed after tag normalization. No tests were written.
- Local demo browser checks covered FAQ open/close, primary reading/article-preview actions, sidebar card removal, inline badge icons, Community Posts/Polls and Back/Forward, poll leaders/remaining options, filled red hearts, gold list/header ratings, keyboard rating changes with focus retained while saving, milestone actions, and equal administration CTA positions.
- Portal review confirmed the combined profile/account controls and device entry point, unsaved profile draft protection, family-card editing with DOB/calendar age, compact Small Steps actions, Light/Dark choices, header-only inbox navigation, and transparent destructive/reaction styling. The selected sidebar profile retains a green surface and readable inverse text in light/dark modes. Appearance, Document Vault, Family, and Small Steps were reviewed at 390px; Family and Small Steps had no horizontal overflow. Demo likes and theme were restored, the review tab had no console errors, and the owned preview was stopped.
- Auth browser/HTTP checks confirmed direct login/signup with missing or expired sessions, expiry while the landing page remains open, active family/staff redirects, preserved return paths, and Route Handler refresh. Malformed cookies, missing demo users, runtime mismatch, and locally simulated profile 401/503 responses left auth forms available; no browser errors were recorded. These checks did not contact live providers.
- The milestone popup measured 338px on desktop with every option on one line; it stayed within a 390px viewport. Typeahead and Escape focus restoration worked. The redesigned inbox passed read/unread restoration, bulk-action scope, archive Cancel focus, mobile layout, and light/dark checks. Staff discount shortcuts opened the creation form and its approval/verification guidance. No browser errors were recorded in that review tab.
- Demo HTTP round trips confirmed normalized post/poll tags, normalized tag filters, case-insensitive duplicate rejection, voting aggregates, and resource rating projection. Synthetic records were removed; changed ratings/reactions/read state and theme were restored. The owned preview was stopped.
- Documentation targets/anchors and formatting were checked across both repositories. DESIGN.md lint reported zero errors and three existing unused-color warnings. Scoped supplemental UI audits completed with known composed-control findings; the broad regex scan did not complete, so it is not a clean repository-wide audit.
- The structured-blog and tag migrations were prepared but not applied by this work. Live backend/provider behavior and the integration gaps in [Integrations](INTEGRATIONS.md) remain outside local demo verification.
