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
