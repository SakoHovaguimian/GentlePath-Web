# Demo Mode

Run `DEMO_MODE=true npm run dev`, or use the sample `.env.local`. Demo mode provides server-owned fictional data through the same services/proxy as live mode. It requires no backend, Firebase, Socket.IO, Messaging, or Amplitude. Missing live configuration never silently selects fixtures.

## Accounts And Controls

All sample accounts use `password123`:

| Account                      | Role          |
| ---------------------------- | ------------- |
| `user@gentlepath.demo`       | Family Member |
| `admin@gentlepath.demo`      | Admin         |
| `superadmin@gentlepath.demo` | SuperAdmin    |

Signup creates an ordinary demo account and an immediate session without email verification. Roles and disabled/deleted status are rechecked against current server records; browser fields cannot grant permissions. Developer role switching signs in a trusted seed identity and clears the previous account's client state. Blog fixtures store Markdown in canonical sections; new writes reject retired body-only payloads and unknown fields, and public slug/UUID reads expose published articles only.

`/dev-settings` and `/dev-settings/components` are available in development or an explicitly enabled demo server. Production live mode hides them and ignores demo preference cookies. Developer mutations require an authenticated session and same-origin checks; role switching/reset additionally require effective demo mode.

Use the development server for local HTTP. Production previews set Secure cookies even in demo mode; Safari needs trusted HTTPS. A successful login that immediately returns to sign-in on local production HTTP can be a cookie-retention issue. Keep production cookie security intact.

## Runtime Selection

[demoRuntime](../src/services/demo/demoRuntime.ts) owns the effective runtime and request simulation. A validated HTTP-only preferences cookie may override the environment only in an allowed developer/demo server. Containers, auth, sessions, public article reads, proxying, and Messaging configuration use the same decision; React receives only public config/session data.

Demo browser push choices use a separate per-user browser preference. The inbox decision card, off warning, and one setup alert can be exercised without requesting OS permission or initializing Firebase; enabling is simulated. Choices persist independently of server-record reset. Demo inbox records link to the account’s own seeded reflection and concrete community/resource detail pages. Running processes upgrade legacy section-only fixture destinations without resetting records or read/archive state.

Changing mode through developer settings clears the old mode's session and requires sign-in. The gated `POST /api/dev-settings/demo` recovery action returns to demo/Populated with zero latency and clears the session; it accepts no identity/role and does not authenticate anyone. Production live returns 404.

Normal requests have no artificial delay. Explicit saved latency remains effective until changed; a development route's first compilation is separate from simulated delay and production performance.

## State, Ownership, And Reset

Demo stores live in the server process and survive navigation/reloads. Multiple processes do not share them; restart restores fixtures. Never enter real private information or treat this as durable storage.

The [DemoApiClient dispatcher](../src/services/demo/demoApiClient.ts) applies request-level simulation and calls module handlers before legacy fallbacks. Core account/portal/blog stores live in `services/demo`; other domains own state under their module's demo/server directories. [The reset route](../src/app/api/dev-settings/reset/route.ts) must register every store.

All active identities, including staff, own only their private records. Child links must be owned. Server handlers validate mutation inputs, roles, visibility, and current account status independently of the UI. Resource favorite membership is authoritative in the portal favorite set; generalized engagement metadata uses that same membership. Dynamic milestone state owns observation history/counts; legacy fixed responses remain compatibility data. Tag capitalization upgrades retained state without clearing edits.

`POST /api/dev-settings/reset` requires confirmation and restores **all server users'** fixtures, removing synthetic accounts/records and uploaded bytes. It reissues a trusted seed session and selects Populated; configured latency is retained. Custom accounts removed by reset must sign in again. Mode changes/recovery do not implicitly reset shared records.

## Response Scenarios

| Scenario  | Behavior                                                            |
| --------- | ------------------------------------------------------------------- |
| Populated | Current process-owned data                                          |
| Loading   | Finite delay of at least 2.5 seconds, then real demo response       |
| Empty     | Empty lists/counts without deleting records; settings remain usable |
| Error     | Recoverable HTTP 503; developer controls stay available             |

Explicit latency is bounded to 0–5,000ms and applies to reads/writes. Apply simulation once at the shared dispatcher; domain handlers implement meaningful empty responses without corrupting stored state. Pending work must finish or fail, not spin forever.

Demo platform flags can block registration/community writes/member maintenance access while staff retain recovery access. Those switches affect only the isolated demo; production policies use the API's canonical platform settings/status contracts described in [integrations](INTEGRATIONS.md).

## Extend And Verify

Implement demo operations with the same models, statuses, paging, ownership, and lifecycle as the actual API. Register reset and shared count/invalidation behavior. Keep fixtures/copy server-owned and in the single strings catalog; no client business fixture flag. Do not initialize external SDKs or emit live provider writes during demo verification.

Use [verification](VERIFICATION.md) for checks and manual flows. Exercise multiple accounts, foreign/private denial, mutation recovery, finite loading, empty state, and reset without deleting another developer's work on a shared preview.
