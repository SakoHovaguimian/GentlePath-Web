# Demo Mode

Start with `DEMO_MODE=true npm run dev`, or set `DEMO_MODE=true` in `.env.local` and restart. The server environment supplies the default. An unavailable live integration never silently falls back to demo data.

For local HTTP browsing, use `npm run dev`. `npm start` runs in production mode and sets `Secure` session and demo preference cookies, even with `DEMO_MODE=true`. Safari rejects those cookies on `http://localhost`, so a successful sign-in can return immediately to the login screen without showing an error. Stop the production server, start `DEMO_MODE=true npm run dev`, and reload the page. To verify the production server in Safari, serve it over trusted HTTPS; keep production cookies secure.

## Server Runtime And Developer Settings

Open `/dev-settings` after signing in. Controls are available in development or on a server explicitly started with `DEMO_MODE=true`. They are unavailable on a production live server, regardless of request cookies. The existing `/dev-settings/components` route remains the shared component reference.

`src/services/demo/demoRuntime.ts` owns the runtime decision:

- `getEffectiveRuntime(cookieStore?)` reads the validated, HTTP-only `gentlepath_demo_preferences` cookie and selects actual server services. Without a valid permitted override, it uses the environment default. Demo runtime configuration disables Firebase Messaging, Socket.IO, and Amplitude.
- `getDemoContext(cookieStore?)` returns the request's response scenario and bounded delay. Both helpers accept a cookie reader for request handlers, or await Next.js `cookies()` themselves.
- `getContainer()` chooses separately cached demo or live services from the effective runtime. Authentication, sessions, the backend proxy, and public article reads use the same decision. React receives only the public runtime configuration and public session.
- Changing modes through `PUT /api/dev-settings` clears the existing session. The browser returns to sign-in and obtains a session for the selected service. Live mode still requires its real backend, Firebase configuration, and a valid `SESSION_SECRET`.

If live services are not configured, the sign-in recovery action calls `POST /api/dev-settings/demo` to select demo services again. This endpoint is available only in development or on an explicitly configured demo server, rejects cross-origin browser mutations, resets simulation to Populated with a 350-millisecond delay, and clears the previous session. It accepts no identity or role and creates no authenticated session; the user must still sign in. Production live returns 404 and ignores demo preference cookies.

The preference cookie is a permitted simulation setting, never a claim about identity or production permissions. Production live ignores it. Session cookies remain encrypted and include the mode; sessions for another mode are rejected. The known local demo secret is accepted only for demo sessions. A live session requires a configured secret of at least 32 characters.

## Demo Identities

All three sample accounts use `password123`:

| Account                      | Role       | Access                                                                                   |
| ---------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `user@gentlepath.demo`       | User       | Their own family profiles, journals, observations, and saved resources                   |
| `admin@gentlepath.demo`      | Admin      | Their private workspace plus article management, basic account directory, and moderation |
| `superadmin@gentlepath.demo` | Superadmin | Admin access plus platform settings and account permissions                              |

Signup creates a user account. In developer settings, account switching calls `POST /api/dev-settings/role`; the server authenticates a trusted seed identity and replaces the encrypted session. Changing a browser role field cannot grant live privileges. Account role and disabled status are checked against current demo state when reading sessions and handling requests, so permission changes take effect without waiting for token expiry.

Only a superadmin can change platform settings, roles, or disabled status. Their own account and the final active superadmin cannot be disabled or demoted. Admin views never expose personal journals, child support notes, observations, or favorites. The legacy user directory and dashboard inspection endpoints are denied to user accounts; profile reads and edits are self-only.

## State And Ownership

All browser domain calls still follow domain service → API client → authenticated `/api/backend/*` proxy. `DemoApiClient` delegates `/portal/*` and `/admin/*` to `demoPortalApi.ts`, and `/blog/*` to the separate article handler. Public article reads use only the published public article path.

State is process-local and survives browser reloads. A process restart resets it; multiple server processes do not share data. Do not use demo memory as production persistence or enter real personal information.

- `getDemoState()` owns accounts, hashed demo passwords, refresh sessions, legacy requests, and chat.
- `getDemoPortalState()` owns family profiles, journals, a shared resource catalog, per-account resource favorites, per-child observations, moderation reports, and platform configuration.
- `getDemoBlogState()` owns article drafts, published articles, and revision checks.

Every personal record is scoped to the authenticated user, including records created by admin and superadmin identities. Child references must belong to that user. Removing a child clears their observation records and detaches their journal references while retaining the journal text. Resource favorite changes and observations update the overview counts; administration counts are derived from current records.

## Response Simulation And Reset

Settings are applied on the server before domain responses:

- **Populated** uses current persisted demo records.
- **Loading** adds a finite delay of at least 2.5 seconds, then returns actual records.
- **Empty** returns empty directories and zero overview counts without deleting records. Return to Populated to see saved records again.
- **Error** returns a recoverable 503 response. Developer settings stay available so this state can be turned off.
- Response delay ranges from zero to 5,000 milliseconds and applies to reads and writes. Loading simulation never leaves an indefinite request running.

`POST /api/dev-settings/reset` restores original account, portal, and blog fixtures, switches the current browser back to Populated, and issues a new trusted seed session. This is shared server state: edits and new demo accounts from every browser on that server are removed. The UI requires confirmation. Existing seed browsers keep access to restored seed records; removed custom accounts must sign in again.

Developer settings, role switching, and reset require an authenticated session and reject cross-origin browser mutations. Role switching and reset also require effective demo mode. The narrowly scoped demo recovery endpoint only changes runtime preferences and clears a session. These routes never call live backend mutations as part of simulation.

## External Integrations And Verification

In demo mode, Firebase REST authentication is replaced with `DemoFirebaseAuthService`; the Firebase browser SDK remains Messaging-only and is disabled. Realtime transport, browser push registration, and Amplitude initialization are disabled. Legacy chat uses local state and polling; notification previews exercise shared local feedback only.

Verify with `npm run check`, `DEMO_MODE=true npm run build`, `git diff --check`, and focused browser or HTTP workflows. Exercise all three roles, private-record boundaries, create/edit/delete flows, favorite and observation counts, error recovery, reset, and rejection of cross-origin mutations. Demo verification does not establish live backend integration behavior. Do not write tests or run Xcode builds.

When extending a domain, use independent model files, authored copy in the single `src/strings.ts` catalog, shared UI primitives, and the existing backend proxy pipeline. Match live route shapes, validation, ownership, statuses, and mutations. Do not add client-only business fixtures or another runtime flag.
