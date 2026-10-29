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
