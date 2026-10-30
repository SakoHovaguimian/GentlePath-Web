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

Follow the API's [persistence and rollout contract](../../GentlePath-API/docs/STRUCTURED_BLOG_API.md#persistence) for the canonical prelaunch schema and pending forward migrations. A TypeScript/Prisma validation command does not apply or execute migration SQL. Do not run database deploy/reset/seed as generic verification. [Integrations](INTEGRATIONS.md) records the retained portal/platform wiring gaps.

Keep this guide and the compact current evidence below up to date; do not append an implementation diary or historical build transcript.

## Current Evidence — October 30, 2026

- Web `npm run check` and `DEMO_MODE=true npm run build` passed under Node 22.21.1 after integration. The sibling API passed `npm run check`, `npm run build`, and `npm run validate`; both repositories passed `git diff --check`. No test files, worktrees, or Xcode builds were added or run.
- Desktop and 390px light/dark review covered the optional gender dropdown below the accent birthday picker, single-line names, one-row expanding textareas, long restored content, popup keyboard/Escape, and unsaved-draft recovery. Local production HTTP verified all five gender values, invalid input, omitted-update preservation, explicit clearing, support-answer persistence, and foreign-family denial. Family/journal editors retain deletion cancellation, gradient reflection cards, private filtering, and first-child defaults.
- Milestones review covered the complete 18-item catalogue, first-child selection, gradient unanswered track, per-response segments/legend, and totals independent of directory filters and pages. Production HTTP verified latest-only classification, every standard response, edits/deletions restoring previous answers, no-store, and foreign-child denial even for staff. Card status, note/history editing, tips, and save controls remain independently usable.
- Community browser review covered larger Posts/Polls navigation with keyboard selection and a visible animated marker, separate Cast Vote/Vote Cast and bookmark actions, voting restoration, attachment creation/reading, and one-level post/poll reply creation and removal. HTTP verified ordered image/video/link arrays, omitted-array compatibility, legacy image projection/clearing, URL/size validation, root/direct-reply paging, depth/relink/foreign-parent denial, ballot media freezing, and ancestor removal affecting counts/saved visibility. Reply paging passed parent-specific URL state, Back/Forward restoration, and empty-page clamping after deletion; draft and deletion confirmations retain safe focus.
- Confirmed resource saves visibly produced unclipped particles; guide rows and independent Family Tips cards expose divider saves. Resource clear-rating confirmation retained safe focus. Vault preview HTTP returned exact inline bytes with 200/206/416, no-store/nosniff/sandbox headers, safe filenames, and 401/404 ownership/removed-child boundaries. The editor supplies a native new-tab preview link; the embedded review browser returned the PDF but could not render its native viewer, so PDF visual rendering and configured live S3 remain unverified. Upload/update/download and editor deletion cancellation passed in demo.
- My Path places its hero below For Your Family and reuses compact gradient reflection cards with editor links and menus. Mark All As Read cleared three unread notifications and disabled at zero; individual states were restored. The notification-disable fill is a scoped semantic 15% alpha rule; verification did not request browser notification permission. Shared error panels passed light/dark/mobile retry and keyboard-focus recovery. Device/saved reduced-motion gates were reviewed without changing operating-system preferences.
- A broader supplemental regex scan was stopped after exceeding 60 seconds. The bounded strict scan completed with 57 reviewed false positives: 23 prop-forwarded/composed button actions, 18 authored Selects, and 16 shared TextAreas. Report: `/tmp/gentlepath-updates-ui-audit.json`; this is not a clean repository-wide supplemental audit. DESIGN lint reported zero errors and three existing informational-use token warnings; runtime theme CSS remains canonical. Project-owned Next, strings, colors, UI ownership, and Tailwind checks passed.
- All verification used isolated local demo previews. Temporary visible records, ballots, ratings/saves, read states, appearance, and viewport were removed or restored; owned preview teardown discards inaccessible synthetic in-memory records. No live backend/provider/analytics writes, migration, reset, or seed commands ran. Live integration remains unverified. Apply the additive child-support, child-gender, and community-attachments migrations and run the API's dedicated `npm run seed:milestones` intentionally in the target environment before relying on those live fields/catalogue; follow the API's persistence contract for other pending migrations.
