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

- Web `npm run check` and `DEMO_MODE=true npm run build` passed. API `npm run check`, `npm run build`, and `npm run validate` passed after custom blog topic/cover support. No tests were written.
- Demo browser review confirmed the removed AI Usage page is unavailable; former ledger facade/canonical proxies returned 404 for reads and mutations. Staff My Path sits after Administration, confirms exit, and retains dirty-draft cancellation. Sequential confirmations start on the safe action and restore focus to the original navigation link after cancellation. Saved Content is reached from the dashboard with no sidebar entry. FAQ disclosures open/close with keyboard controls and expanded purple titles; Light/Dark previews retain their respective palette in both active modes.
- Notification demo choices passed undecided → off → enabled → off, persistence on reload, shared Appearance controls, and bell setup-alert removal (4 including setup → 3 actual unread). Read/unread icons changed counts correctly and archive cancellation retained the record. Notification links opened specific community/resource details and focused the owned journal card; pagination selected page two with nine temporary records. Reload, repeated opens, Back/Forward, search focus, Edit/cancel, and 390px targeting passed. Foreign journal links showed unavailable content and the corresponding detail read returned 404; following updates left unread counts unchanged. Temporary reflections were removed. FAQ, theme, and inbox screens fit 390px without horizontal overflow. Native permission requests and live Messaging were not exercised; browser review used the isolated demo preview.
- Desktop demo review confirmed compact sage/lilac/sunlight headers with content/actions retained and leading icons removed, a two-column moderation grid, green primary Save Changes even for access-reducing edits, thirteen aligned block previews, and separate guide-step cards with working reorder controls. The People header measured about 125px high. Family, journal, Small Steps, document, and community screens omit their secondary message banners; My Path retains its illustrated hero. These pages fit 390px without horizontal overflow. Manage Platform hover retained readable contrast in both themes without a primary-button overlay. Saved-card bookmarks passed Keep Saved and confirmed removal; the saved resource was restored.
- Blog browser/HTTP checks covered topic creation, public cover upload, structured draft save/reload, reusable topic/cover choices in a new article, user denial of staff options, draft-only topic privacy, published SSR, and removal of the last article using a custom choice. Synthetic articles were deleted; unreferenced demo uploads disappeared when the owned preview stopped. The user-owned preview was left running.
- Saved Content, moderation, blog palette, and guide editor fit a 390px viewport without horizontal overflow. Dark header contrast passed and theme was restored; no console errors were recorded. Rating pickers, resource-card summaries, and detail-header summaries use the shared forest/sage palette with neutral panel borders. Light/dark selected and empty states, fractional aggregates, keyboard selection, removal, and 390px layout passed; the temporary rating was removed. Active rating contrast measured at least 6.45:1 against the reviewed panel/header surfaces. Earlier local checks cover profile/account consolidation and draft guards, family age/editing, sidebar selection/scroll boundaries, removed privacy decorations, compact Small Steps, Light/Dark choices, and inbox/archive behavior.
- Earlier demo verification covers auth expiry/refresh and return paths, tag normalization and filters, voting/reaction/rating projections, keyboard rating focus, shared disclosures/selects, and Community Posts/Polls history. These checks did not contact live providers. Scoped supplemental audits retain their known composed-control findings; the broad regex scan was not a clean repository-wide audit.
- The structured-blog, tag, and custom topic/cover migrations were prepared but not applied by this work. Deploy `20261029180000_blog_custom_topics_covers` with the updated API before live custom-value writes. Live provider behavior and the gaps in [Integrations](INTEGRATIONS.md) remain outside local demo verification.
