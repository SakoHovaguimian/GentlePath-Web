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

- Web `npm run check` and `DEMO_MODE=true npm run build` passed under Node 22.21.1; the sibling API passed `npm run check`, `npm run build`, and `npm run validate`. Web builds used an isolated source copy to preserve the running preview. The additive milestone-image migration was reviewed but not applied. No tests, worktrees, Xcode builds, live provider writes, database operations, or demo resets were added or run.
- Desktop and 390px light/dark browser review covered the horizontal reflection rail and its arrows, welcome dismissal, weekly activity ordering, full-width complete/partial family summaries, consistent resource/community reader width, per-step images and heading focus, and source-panel removal. All reviewed narrow pages had no document overflow. Existing final-step guidance, resource collection navigation, and external content links remain intact.
- A three-second simulation confirmed that Posts/Polls navigation retains all four posts with a progress cursor and no replacement loader until destination data and ballots are ready. Poll filtering retained three cards while fetching, then showed its empty result; clearing restored the input focus. Milestone child switching retained the summary while all five mounted segments animated to zero for the unanswered child. Both device and saved reduced-motion gates remain in the shared motion owner.
- Poll options passed 0/33/50/67/100% shares, 15% unselected and opaque selected fills, and contrasting text across the filled/unfilled boundary in light/dark and narrow layouts. Theme previews use an explicit rounded clip. The account-deletion entry action computed a 15% alpha danger background inside its restyled card; no deletion was submitted.
- HTTP review verified two owned children with complete/partial support details, six reflections including multiple/empty feelings and a personal entry, 18 milestone totals spanning every standard response, ordered post attachments, single/multiple/empty poll ballots, three guide-step images, and structured blog image/gallery blocks. Four discount orders, sorting before pagination, invalid-sort 400 responses, finite empty results, and 503 recovery passed in demo. Staff access to another account’s child summary returned 403. The live sorting facade is implemented against the existing newest-first API contract; configured live behavior remains unverified.
- Admin metrics and role summaries expose native links to the matching filtered directories. Browser review confirmed the Active Accounts filter, the three current role options, popup Escape, and hero artwork opening story authoring. Demo seeds contain only User/Admin/SuperAdmin identities; historical live role parsing remains compatible.
- Shared public-image checks covered saved milestone upload/removal, all 18 distinct Picsum defaults, guide-step reordering and reader display, exact uploaded public bytes, unauthenticated/member denial (401/403), invalid MIME/signature/size/URL rejection (400), omitted-image preservation, explicit-null clearing, and synthetic-record cleanup. Delayed cancellation kept the prior image, blocked Save while pending, and restored Replace Image focus; an invalid image retained the guide draft and recovered on retry. Desktop/390px review covered image/no-image cards, upload controls, and light/dark moderation cards/details without document overflow.
- Admin milestone multi-tag browser/HTTP checks covered any-tag matching (Communication + Connection returned eight records), search/progress combinations, filtering before pagination, legacy `tag` links, repeated/single `tags`, duplicate handling, blank/oversized/31-value rejection, foreign-child 403, Back/Forward, offset reset, and both clear actions. The 30-tag limit left selected choices removable; unknown tags recovered through Clear Filters. Desktop/390px light/dark popups fit the viewport. A one-second refresh retained eight table rows until all 11 new matches arrived. API OpenAPI/Hono parsing accepted both single and repeated values without splitting commas. No new database migration is required for tag filtering; configured PostgreSQL execution remains unverified.
- Moderation sorting changed URL/history state and keyboard selection, stayed inside the narrow viewport, and sorted before pagination. A click on the card footer opened review; resolved cards reopened the saved decision/note. Guide Back and sidebar navigation reached their requested routes after Discard Changes; Keep Editing retained the draft, and milestone modal discard closed both layers.
- DESIGN lint reported zero errors and three existing informational-use token warnings. Broad supplemental scans exceeded their time bounds. The changed-source scans completed: the earlier report contains 14 composed Button-link false positives; the image/moderation report contains three false positives for shared TextArea usages whose canonical owner supplies resize-none and auto-growth. Reports: `/tmp/gentlepath-browser-comments-ui-audit.json` and `/tmp/gentlepath-milestone-ui-audit.json`. The changed-source multi-tag UI scan passed strict mode with zero findings (`/tmp/gentlepath-multi-tag-ui-audit.json`). These are not clean repository-wide supplemental audits; project-owned Next, strings, colors, shared-UI, and Tailwind checks passed.
- Verification used only isolated disposable demo processes. Temporary response delay and appearance were restored, owned previews were stopped, and the user-owned preview was left running. Refreshed fixtures load in a new process or an explicit reset; retained running demo records are not overwritten. Live Firebase/backend/storage/socket/push/analytics integration remains unverified; follow the API persistence contract for pending migrations and intentional catalogue seeding.
