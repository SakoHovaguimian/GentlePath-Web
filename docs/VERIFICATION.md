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

| Area | Observed result |
| --- | --- |
| Demo login | Seed credentials sign in; the public response contains user information and expiry without Firebase tokens. |
| Demo signup | A new account can sign up, edit its own profile, and sign out. |
| Profile | Saving through the browser uses `PUT /users/:id`, refreshes the public session, and displays the shared success toast. A different account receives 403 when attempting the same user's update. |
| Feature requests | Browser creation persists across reload. Editing and deletion of the verification record succeed. A different account cannot read that record. |
| Chat and alerts | A sent demo message survives reload. Simulated alerts use the shared, dismissible toast. Empty messages receive 400. |
| Session refresh | An expired demo access token refreshes server-side, reissues the encrypted cookie, and returns no private tokens in JSON. |
| Request boundaries | An unauthenticated backend request receives 401. A mutation with a foreign Origin receives 403. |
| Integration isolation | Demo settings explain disabled analytics and simulated notifications. The demo Messaging worker has no live configuration or code. |
| Responsive layout | Profile and Appearance were inspected at 390px; chat at 1280px. The checked screens had no horizontal document overflow. Temporary viewport overrides were removed. |

Temporary feature-request verification data was removed. Existing demo content was preserved. The demo server was not restarted to clear the user's active session or chat state.

## Title-case copy verification — October 12, 2026

- `npm run check`, `DEMO_MODE=true npm run build`, and `git diff --check` pass for the title-case catalog and lint changes.
- An in-memory ESLint check of the catalog with `Save Profile` changed to `Save profile` reports the expected `copy/title-case` error. The actual catalog remains valid; no test files were written.
- Local demo browser review covered sign-in copy, dashboard headings and table headers, navigation action names, profile field labels and the save CTA, and the shared component library's headings, controls, and feedback titles. Profile labels fit the browser's compact layout. Supporting prose, sample Markdown, demo credentials, and record content retain their original case. No profile or domain mutations were submitted.
- Live backend, analytics, and push integrations were not exercised for this copy change.

## Live integration limits

Firebase REST authentication/refresh, backend provisioning and authorization, Socket.IO ticket issuance/broadcasts, browser permission/device registration, FCM foreground/background delivery, and Amplitude event delivery require real configuration and backend endpoints. Those external flows were not exercised. No production analytics events or push permission prompts were triggered.

The live backend must implement [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md) and [REALTIME.md](REALTIME.md). Demo state is process-local and resets on restart; it is not durable or shared across replicas. Production rollout should verify these integrations in a configured staging environment, including multi-instance refresh behavior and notification cleanup.
