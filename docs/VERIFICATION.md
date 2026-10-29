# Migration verification

Verified locally on October 4, 2026 with Node 22, Next.js 16.2.10, React 19.2.4, and `DEMO_MODE=true`. No test files were written and no Xcode builds were run.

## Static and production checks

- `npm run check`: ESLint, Next.js route type generation, TypeScript, and the display-string check pass.
- `DEMO_MODE=true npm run build`: optimized Turbopack production build passes, including the backend proxy, authentication routes, and Messaging worker route.
- Frontend Design Premium static audit in strict mode: no findings.
- `git diff --check`: no whitespace errors.
- Installed versions match the requested exact Next.js and React versions. Source has no Firebase Auth browser SDK, Firebase Admin, frontend Sentry, or old workspace package imports.

The string check is a guard against inline display copy, including default messages and loading labels. Review dynamic copy and third-party content as described in [STRINGS.md](STRINGS.md); it is not a substitute for localization review.

## Manual workflows

| Area                  | Observed result                                                                                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Demo login            | Seed credentials sign in; the public response contains user information and expiry without Firebase tokens.                                                                                     |
| Demo signup           | A new account can sign up, edit its own profile, and sign out.                                                                                                                                  |
| Profile               | Saving through the browser uses `PUT /users/:id`, refreshes the public session, and displays the shared success toast. A different account receives 403 when attempting the same user's update. |
| Feature requests      | Browser creation persists across reload. Editing and deletion of the verification record succeed. A different account cannot read that record.                                                  |
| Chat and alerts       | A sent demo message survives reload. Simulated alerts use the shared, dismissible toast. Empty messages receive 400.                                                                            |
| Session refresh       | An expired demo access token refreshes server-side, reissues the encrypted cookie, and returns no private tokens in JSON.                                                                       |
| Request boundaries    | An unauthenticated backend request receives 401. A mutation with a foreign Origin receives 403.                                                                                                 |
| Integration isolation | Demo settings explain disabled analytics and simulated notifications. The demo Messaging worker has no live configuration or code.                                                              |
| Responsive layout     | Profile and Appearance were inspected at 390px; chat at 1280px. The checked screens had no horizontal document overflow. Temporary viewport overrides were removed.                             |

Temporary feature-request verification data was removed. Existing demo content was preserved. The demo server was not restarted to clear the user's active session or chat state.

## Title-case copy verification — October 12, 2026

- `npm run check`, `DEMO_MODE=true npm run build`, and `git diff --check` pass for the title-case catalog and lint changes.
- An in-memory ESLint check of the catalog with `Save Profile` changed to `Save profile` reports the expected `copy/title-case` error. The actual catalog remains valid; no test files were written.
- Local demo browser review covered sign-in copy, dashboard headings and table headers, navigation action names, profile field labels and the save CTA, and the shared component library's headings, controls, and feedback titles. Profile labels fit the browser's compact layout. Supporting prose, sample Markdown, demo credentials, and record content retain their original case. No profile or domain mutations were submitted.
- Live backend, analytics, and push integrations were not exercised for this copy change.

## Shared UI foundation verification — October 12, 2026

- `npm run check` passes without warnings: ESLint, route type generation, TypeScript, display strings, semantic colors, and shared UI ownership.
- `DEMO_MODE=true npm run build` passes for the component library and existing application routes. `git diff --check` passes. No tests were written and no Xcode builds were run.
- All 22 pasted Tailwind IntelliSense canonical-class diagnostics in Select and MultiSelect were addressed. Production browser inspection confirms the canonical classes generate selected backgrounds/text, keyboard focus outlines, trigger-width popups, themed borders, and overlay shadows.
- `npm ls react-aria react-aria-components` confirms React Aria Components 1.21.1 shares the single React Aria 3.52.1 dependency. The direct dependency is pinned exactly; upgrades must retain a shared PortalProvider context.

| Area                   | Observed demo result                                                                                                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component route        | Demo sign-in reaches the protected component library. One page h1 and one component scroll legend; the duplicate section dropdown is removed.                                                                                                  |
| Stepper                | Horizontal stages share a row; vertical stages share a column. Selecting a stage synchronizes both specimens' complete/current states. Labels fit at 390px and 1280px with no horizontal document overflow.                                    |
| Theme states           | Blue selections use the same surface blend across tiles, chips, and listbox options: 8% in light mode and 14% in dark mode. Section-card hover uses the shared accent/surface token. Success, warning, and error retain their semantic colors. |
| Motion                 | Saved Reduced motion survives reload and removes indicator/button transitions. Four-choice segmented controls use the authored Select at compact widths; two choices retain their capsule.                                                     |
| Mobile navigation      | At 390×844 the menu fills the viewport, focuses its close action, and restores the opener after Escape.                                                                                                                                        |
| Select and MultiSelect | Selecting two MultiSelect options gives both the themed fill; keyboard movement shows a visible brand outline. Clearing selections returns the placeholder. Popup shadows and borders render after the canonical-class cleanup.                |
| Modal popup            | At 390×844 the Select popup stays inside the dialog and its focus scope, fits the trigger and viewport, and closes on the first Escape while the dialog remains open. The next Escape closes the dialog and restores Open Dialog focus.        |
| Directory preview      | An unmatched local search shows the empty state; clearing the search restores rows.                                                                                                                                                            |

Verification used local demo data. Temporary selections were cleared, preview appearance was restored, and viewport overrides were reset. No live backend mutations, analytics events, notification permission prompts, or assistant-generation integrations were used.

### Supplemental audit limitations

The Frontend Design Premium strict text audit reports 17 findings in this component-based implementation: nine authored `<Select>` usages misread as native `<select>`, seven composed/prop-forwarding actions it cannot trace, and one shared TextArea whose inherited `resize-none` is not visible at its caller. These were reviewed against the shared implementations and manual workflows; the report is not a clean audit. The repository's TypeScript-based shared UI check passes and distinguishes component identifiers from native elements.

The supplemental DESIGN.md linter reports no errors and three unused-color warnings for the documented text, muted, and border roles. Runtime CSS remains canonical; these entries record the accepted palette rather than generate utilities.

## Editor warning cleanup — October 12, 2026

- `npm run check` now fails on any ESLint warning, Next.js editor plugin diagnostic, or non-canonical Tailwind class. It passes with zero warnings. `DEMO_MODE=true npm run build` and `git diff --check` pass.
- Tailwind classes were rewritten only to the canonical form reported by the project's own design system. A comparison against `HEAD` confirms each file's class lists are unchanged apart from those rewrites. Replacements that resolve through theme variables use equal values: `--radius-3xl` is 1.75rem, `--spacing` is 0.25rem, and `--container-3xl` is 48rem.
- Route `metadata` exports are typed as `Metadata`. Barrel-exported interactive components keep `'use client'` and declare named props interfaces. Two preference providers, `useReviewedDraftAssistant`, and three client-only sub-parts dropped the unneeded directive.
- A demo production server returned 200 for sign-in, signup, and all protected routes after demo sign-in, and 404 for the server-rendered not-found page, with no server errors. Interactive overlay and selection behavior was not re-exercised in a browser; these changes are type-level, directive, and CSS-equivalent class edits.

## Live integration limits

Firebase REST authentication/refresh, backend provisioning and authorization, Socket.IO ticket issuance/broadcasts, browser permission/device registration, FCM foreground/background delivery, and Amplitude event delivery require real configuration and backend endpoints. Those external flows were not exercised. No production analytics events or push permission prompts were triggered.

The live backend must implement [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md) and [REALTIME.md](REALTIME.md). Demo state is process-local and resets on restart; it is not durable or shared across replicas. Production rollout should verify these integrations in a configured staging environment, including multi-instance refresh behavior and notification cleanup.

## Safari Local Demo Sign-In — October 28, 2026

- Reproduced Safari returning to `/login?redirectTo=%2Fdashboard` without an error when the local HTTP server was running via `npm start`. The demo login endpoint returned 200 with a `Secure` session cookie; Chromium accepted the local session while Safari did not retain it.
- Restarted the local server with `DEMO_MODE=true npm run dev`. Safari sign-in reached `/dashboard`, loaded seeded journals, resources, and overview data, and returned 200 for session reads. Production cookie settings remain unchanged.
- Added the local HTTP versus production HTTPS requirement to README and the demo guide. `git diff --check` passes. Source code did not change, so static checks and the production build were not rerun. No tests, Xcode builds, or live integration requests were used.

## GentlePath implementation — October 28, 2026

Implemented in the existing checkout using dedicated GPT 6.1 Sol Max agents for landing/design, blog publishing, and demo systems. No worktree, test files, Xcode builds, live backend writes, external notifications, or analytics were used.

### Checks

- `npm run check` passes with zero warnings: ESLint, route-aware TypeScript, Next editor diagnostics, strings, semantic colors, shared controls, and canonical Tailwind classes.
- `DEMO_MODE=true npm run build` passes with the optimized Turbopack production build, including all public, family, administrative, publishing, and developer routes.
- `git diff --check` passes. DESIGN.md lint has zero errors and the three documented unused-color warnings (text/muted/border); runtime CSS remains canonical.
- The supplemental premium regex audit reports 43 matches: 22 composed/forwarded Button actions, 16 capitalized authored Select components treated as native selects, and five shared TextArea callers whose inherited resize rule is not visible. These are reviewed against shared owners; this is not a clean regex-audit result. The repository's TypeScript shared-control checker passes.
- Named GentlePath catalog exports are included in both title-case checks. Supporting prose, credential data, and authored fixture content have narrow, reasoned casing annotations.
- The installed Turbopack development CSS resolver reproduced a relative-import failure from the repository root. `npm run dev` now explicitly uses the supported Webpack development flag; production builds retain Turbopack.

### Observed demo workflows

| Area                      | Actual result                                                                                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reference identity        | Six exact embedded illustrations and local DM Sans/Lora fonts extracted from the supplied HTML. Light/dark landing and portal share the reference palette.                                                                                                   |
| Public landing            | Desktop and 390px layout, functional section anchors, FAQ click/keyboard disclosure, responsive navigation, signup/login/blog destinations.                                                                                                                  |
| Authentication            | Three seeded identities return trusted roles; login/signup validate individual fields, retain failure input, mask passwords, and use role-aware destinations.                                                                                                |
| Journals                  | Browser create → edit → shared delete confirmation → delete succeeds; first invalid field focuses; child selector works inside the modal; private search stays out of URL state.                                                                             |
| Family and observations   | Browser child creation, native date entry, per-child observation recording, and server ownership validation succeed.                                                                                                                                         |
| Resources                 | Browser saves a resource and observes it in Saved Resources; library/detail navigation uses the same API state and counts.                                                                                                                                   |
| Blog                      | Browser draft save → publish confirmation → public article read → unpublish → delete succeeds. Isolated HTTP verifies draft 404, management 401/403, stale revision 409, duplicate slug 400, and paging/filter contracts.                                    |
| Administration            | Role-specific navigation, derived metrics, user directory, moderation, and SuperAdmin-only platform controls render. User administrative reads and Admin permission/config mutations return 403. Private journals and foreign-child observations are denied. |
| Platform gates            | Disabling registration rejects signup; pausing community rejects writes; maintenance rejects member domains while administrative operations remain usable. Settings were restored.                                                                           |
| Demo tooling              | Browser Empty and Error scenarios are visible and recoverable; HTTP Loading resolves after at least 2.5 seconds. Populated, latency, trusted role switching, reset, and cross-origin rejection pass.                                                         |
| Runtime recovery          | Demo→live clears the session; gated unauthenticated recovery restores demo routing without granting identity; regular sign-in is still required.                                                                                                             |
| Disabled account recovery | Disabled identity can open sign-in (200); protected navigation ends at sign-in after one 307, without a redirect loop. Account was re-enabled.                                                                                                               |
| Production live boundary  | Separate production-live instance returns 404 for developer settings/recovery despite a forged demo preference cookie, rejects demo sessions with 401, and renders public landing/login without demo recovery controls. No live backend request was made.    |
| Responsive and keyboard   | 1280px desktop and 390×844 phone checks show no document overflow; wide user table owns horizontal scrolling. Mobile menu traps focus, closes on Escape, and restores its opener. Shared confirmations focus the safe action.                                |

Public date formatting resolves the reader's browser timezone instead of the execution host's timezone. Temporary demo authoring records were deleted or cleared by restarting the disposable server. Production live integration remains unverified and requires the contracts in GENTLEPATH.md, BLOG.md, and BACKEND_CONTRACT.md. The field guide's file vault, community posting/polls, advertising, proposed additions, and AI concepts remain outside the implemented screens.

## iOS Reference Visual Refresh — October 29, 2026

Reviewed all 15 supplied iOS reference images and used three GPT-6.1 Sol agents at Max effort for public/auth, family, and administrative surfaces. The existing checkout, routes, shared controls, permissions, and service ownership were retained. Three new built-in ImageGen illustrations are saved under `public/gentlepath`; [visual assets](VISUAL_ASSETS.md) records their uses and exact prompts. DESIGN.md and the UI/behavior guides now describe the stronger palette, forest navigation, serif hierarchy, and capsule actions.

### Checks

- `npm run check` and `DEMO_MODE=true npm run build` pass. The production build includes the existing public, protected, administration, and developer routes. No tests or Xcode builds were written or run.
- `git diff --check` passes. DESIGN.md lint has zero errors and the same three unused documentation-color warnings for text, muted, and border. Supporting text on the full-tint sage/lilac/sunlight/clay surfaces meets 4.5:1 contrast; the sunlight pair measures 4.79:1.
- The supplemental strict regex audit reports 44 reviewed component-pattern matches: 22 composed/forwarded Button actions, 17 capitalized authored Select usages misread as native selects, and five shared TextArea callers whose inherited resize rule is not visible. Its JSON is retained locally as ignored `premium-audit.json`; this is not a clean strict-audit result. The repository's TypeScript shared-control check passes. The new sidebar scrollbar supplies both standard properties and engine fallbacks.

### Observed Demo Workflows

| Area                 | Actual Result                                                                                                                                                                                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop presentation | Landing, family dashboard, administrative metrics, people directory, publishing editor, and review dialogs inspected at desktop widths, including 1440×1000.                                                                                                                                                                  |
| Narrow presentation  | Landing, public blog, authentication, dashboard, family banner/form, and resource collections inspected at 390×844. Checked pages have no horizontal document overflow. Collection actions stay on one line with 44px height.                                                                                                 |
| Navigation           | Forest desktop navigation and the full-screen mobile menu share the same destinations and colored active state. The mobile menu focuses Close, traps navigation in the dialog, closes on Escape, and returns focus to its opener. Public mobile navigation opens and closes with Escape.                                      |
| Journals             | Empty submission shows validation and focuses the title. A synthetic reflection was created, edited, and deleted through its confirmation. The confirmation initially focuses Cancel. Private search stays out of the URL; clearing restores the list and input focus.                                                        |
| Resources            | Collection selection updates the category URL/filter and bounded list. A resource save appears in Saved Resources. New scene images load without broken-image results. Temporary preview state was cleared by restarting the isolated process.                                                                                |
| Administration       | User/Admin/SuperAdmin role presentations inspected. People role filtering works by keyboard and updates URL state. User edit and report review dialogs open; their authored popups remain inside the parent dialog and close on the first Escape. No account access, role, publication, or moderation decision was submitted. |
| Theme                | Light and dark family views inspected. Shared solid-action text resolves to dark ink on the dark theme's pale mint action surface. Sidebar active, hover, and keyboard-focus roles use explicit contrasting pairs.                                                                                                            |

Browser mutations used a separate local demo production preview on port 3002, with its canonical origin explicitly configured. The synthetic journal record was removed; process restart cleared remaining temporary preview state. The existing development server was not restarted. Live backend, analytics, messaging, and production authorization integrations were not exercised. Alternate accent presets and device-level reduced-motion combinations were not exhaustively rechecked in this visual pass; their existing providers and shared token/motion contracts remain in place.

## Portal Expansion And Structured Publishing — October 29, 2026

Implemented the nine requested feature groups in the existing checkout with dedicated GPT-6.1 Sol agents at Max effort. This entry supersedes the earlier implementation entry's feature exclusions. [GENTLEPATH.md](GENTLEPATH.md) links the focused ownership, route, and live API guides. The sibling GentlePath API also contains the structured publishing contract and migration. No worktree, test files, Xcode build, database migration, live backend write, notification delivery, or analytics transmission was used for verification.

### Final Checks

- `npm run check` passes with zero warnings, including ESLint, route-aware TypeScript, Next editor diagnostics, display strings, semantic colors, shared controls, and canonical Tailwind classes.
- `DEMO_MODE=true npm run build` passes, including all new family, editorial, community, publishing, commercial, notification, and operator routes.
- In the sibling API, `npm run build` and `npm run validate` pass with the structured blog, content visibility, favorite projection, and operator permission changes.
- The supplemental full premium regex audit was stopped after its scanner remained in regular-expression parsing for more than three minutes; a bounded rerun identified the same scanner location. Module-scoped reports were reviewed against shared controls. Notifications has zero scoped findings; other reports include the known authored Select, composed Button, and inherited TextArea false positives. This is not a clean full supplemental-audit result. The repository's TypeScript-based shared-control check passes.

### Browser Verification

| Area | Observed Result |
| --- | --- |
| Portal history | Dashboard → Document Vault → Guided Steps, then Back and Forward, restores the previous portal page. Guide search adds history; Back restores the empty search and full list, and Forward restores the search and filtered result. |
| Navigation responsiveness | Clean navigation keeps Next Link semantics without awaiting a resolved guard promise. Normal demo requests no longer add the previous 350 ms delay. Fresh query results are retained for 30 seconds, inactive results for five minutes, and live Socket.IO/Firebase Messaging imports are deferred until needed. These are verified implementation changes, not a live performance benchmark. |
| Structured builder | Admin adds heading and section blocks through the plus palette, edits their fields, reorders with move buttons, physical pointer drag, and repeated Arrow Up/Down, opens private preview, and saves the draft. Stable block IDs and content survive each reorder. Safari keyboard focus remains on the moved handle. |
| Notifications | Read/unread mutations update the item and unread count. Archive confirmation initially focuses Cancel and returns focus on cancellation. An unsaved timezone change prompts once; Keep Editing retains the draft and explicit discard restores saved values. Browser timezone synchronization and the disabled automatic-timezone field display the same detected zone. |
| Overlays and narrow layout | At 390×844, notification settings and the blog builder have no horizontal document overflow. Builder actions wrap, and the timezone popup fits its trigger. Escape closes the popup and restores focus. The mobile navigation fills the viewport, focuses Close, and returns focus to its opener. Nested discard confirmation no longer reopens itself. |
| Themes | Notification settings inspected in light and dark themes; the existing forest/ivory visual system and shared surfaces are retained. The preview was restored to light, its viewport override reset, and the verification account signed out. |

The browser-created structured draft was removed and verified missing. The owned development and production preview processes were stopped after verification. Demo state is process-local and disposable; no seeded account was deleted.

### Focused Demo HTTP Verification

| Feature | Observed Result |
| --- | --- |
| Document Vault | Actual local image bytes upload, owned metadata editing, filtering, private download, and removal succeed. Foreign document access is rejected. |
| Editorial | Guide authoring and item ordering, resource types/formats, collections, and source attribution round-trip through the domain API. Family and administrative pages return 200 for their authorized roles. |
| Engagement | Ratings validate their range; likes and saves are idempotent. General saved content uses its typed target and ownership checks, and private or unavailable targets are rejected. Dashboard saved counts follow the authoritative state. |
| Community | Post/comment/reaction flows, author ownership, report snapshots, member report history, and staff queue/review were exercised. Administrative access does not grant author-edit rights. |
| Polls | Creation, option validation, single/multiple voting, results, discussion, and reaction flows pass. Historical ballots prevent invalid option changes. |
| Milestones and tips | Guidance/options administration, owned private observation history and correction, tip submission, review, and return-to-review after edits pass. Retired choices remain readable in historical observations. |
| Commercial | Sponsor/discount/campaign/creative/placement lifecycle, verification/review and enablement gates, placement history, serving, and aggregate metric reads pass. Demo metric simulation is explicit and does not send live analytics. |
| Notifications | Inbox/counts, single/bulk read state, archive scopes, category/channel preferences, timezone validation, ownership, and demo error/loading behavior pass. |
| Account and operations | Device paging omits tokens and rejects foreign removal. Operator reads/writes enforce role boundaries. AI ledger lifecycle, delivery attempts, and API-backed legal/FAQ reads pass. A temporary signup account rejects mismatched deletion confirmation, then deletes successfully, clears its session cookie, and cannot authenticate again. |
| Structured publication | A production demo preview accepts a real local image upload and an article containing all 13 block types. Draft public reads return 404; publish exposes all 13 blocks and their text/media in server-rendered HTML. Authored JSON block text is searchable. Stale revision returns 409, unsafe URL returns 400, and unpublish restores public 404. The synthetic article was removed. |
| Production route access | Fourteen family routes, nine staff authoring/administration routes, and both operator routes return 200 for the appropriate demo identities. An ordinary member requesting commercial administration is redirected to access denied. |

### Live Integration Limits

The authored API migration `20261029110000_structured_blog_content` remains unapplied. It adds ordered typed metadata as PostgreSQL JSONB with a GIN containment index and preserves legacy content. JSONB containment is queryable; the current index is not a claim of optimized arbitrary substring search. See [BLOG.md](BLOG.md) and the API's [structured publishing guide](../../GentlePath-API/docs/STRUCTURED_BLOG_API.md).

These checks establish local demo behavior, static compatibility, and build success. Configured PostgreSQL migration/data reads, Firebase authentication/authorization, S3 private/public object access, Socket.IO, push/email delivery, provider retention, and the backend operator allowlist still require staging integration verification. Account deletion follows the API's soft-delete behavior and does not claim permanent data, object, or Firebase identity erasure. No live deployment or migration was performed.
