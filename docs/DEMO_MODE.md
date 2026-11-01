# Demo Mode

Run `DEMO_MODE=true npm run dev`, or use the sample `.env.local`. Demo mode provides server-owned fictional data through the same services/proxy as live mode. It requires no backend, Firebase, Socket.IO, Messaging, or Amplitude. Missing live configuration never silently selects fixtures.

## Accounts And Controls

All sample accounts use `password123`:

| Preset              | Account                      | Starting State                                                                      |
| ------------------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| New User            | `new@gentlepath.demo`        | Setup complete, California and No Preference saved, no children or private activity |
| Onboarding New User | `onboarding@gentlepath.demo` | Setup restarts at every sign-in through the demo login form                         |
| Family Member       | `user@gentlepath.demo`       | Populated family space and application follow-ups                                   |
| Admin               | `admin@gentlepath.demo`      | Content administration and its own populated family space                           |
| SuperAdmin          | `superadmin@gentlepath.demo` | Platform administration and its own populated family space                          |

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

All active identities, including staff, own only their private records. Child links must be owned. Server handlers validate mutation inputs, roles, visibility, and current account status independently of the UI. Resource favorite membership is authoritative in the portal favorite set; generalized engagement metadata uses that same membership. Dynamic milestone state owns observation history/counts; legacy fixed responses remain compatibility data. Milestone reads accept repeated `tags` parameters with the same any-tag matching, normalization, validation, search/progress combinations, and filtering-before-pagination behavior as the API; legacy `tag` remains compatible. Tag capitalization upgrades retained state without clearing edits.

Community post/poll demo stores retain ordered public attachments and immutable one-level reply links. Root/direct-reply paging uses the same scopes and ascending thread order as the API. Hidden/deleted ancestors or disabled/deleted authors hide replies from discussion counts, reactions, reports, and saved-target resolution; authors can still remove their own hidden replies. Poll media is fixed once voting starts. Reset restores the seeded root/reply discussions and removes added attachments with their synthetic records.

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

## Fixture Coverage

Fresh demo processes and explicit resets seed two children per populated Family Member/Admin/SuperAdmin account: a complete profile with optional gender and all support answers, and a lightly filled profile. Six reflections cover multiple/empty feelings, both children, and an unlinked personal entry. Milestones cover all four standard answers plus unanswered items and a second child with no observations. All 18 catalogue milestones have distinct seeded Picsum header URLs; retained state fills only missing image fields and preserves staff edits or explicit removal. Polls cover single/multiple selection, mixed vote shares, recorded ballots, and a poll without votes; community discussions include ordered image/link attachments and replies. Guided Steps includes a different image for each step, the first structured blog includes an image and gallery, and four offers expose distinct creation/expiry/title orders.

Resources include 48 individual reads and tools across 12 canonical collections, each with four children in a fresh catalogue. The catalogue spans four categories, 21 topic tags, three family formats, varied dates, and 3–16 minute reads for search, sorting, saved-content, and pagination checks. Retained previews receive a one-time additive catalogue upgrade that preserves staff edits, deleted-resource tombstones, favorites, and private records; explicit reset restores the full catalogue.

[demoMedia](../src/services/demo/demoMedia.ts) assigns fixed public-looking identifiers to bundled illustrations. Demo readers resolve only those exact identifiers to local artwork; live URL validation and media loading remain unchanged. Bundled illustration fixtures need no external host; the requested milestone Picsum placeholders load from picsum.photos and use the card fallback if unavailable. Fixture edits apply to a new process or an explicit reset; they do not overwrite records in an already-running preview.

Guide-cover, per-step, and milestone image uploads share the existing process-owned public byte store with blog uploads (20 images/25 MB total). Staff-only upload validation checks real PNG/JPEG/WebP/GIF signatures and the 5 MB limit; successful content uploads return `/api/public/content-media/{id}`. The exact demo media path is accepted alongside permanent public HTTPS URLs, while live saves receive the storage provider's HTTPS URL. Both public media routes serve typed, no-sniff, sandboxed, no-store responses only in effective demo mode. Reset/restart removes uploaded bytes and restores seeded milestone images; failed or cancelled uploads retain the prior field value.

## Extend And Verify

Implement demo operations with the same models, statuses, paging, ownership, and lifecycle as the actual API. Register reset and shared count/invalidation behavior. Keep fixtures/copy server-owned and in the single strings catalog; no client business fixture flag. Do not initialize external SDKs or emit live provider writes during demo verification.

Use [verification](VERIFICATION.md) for checks and manual flows. Exercise multiple accounts, foreign/private denial, mutation recovery, finite loading, empty state, and reset without deleting another developer's work on a shared preview.

### Empty And Onboarding Presets

New User is a separate ordinary family identity with only the basic required profile/setup information filled in: state California, explicit No Preference, completed setup, and Add Children Later. It has no seeded children, reflections, saved content, applications, Goals, documents, or inbox records. It opens My Path directly and retains any records created during exploration until a global demo reset.

Onboarding New User selects `onboarding@gentlepath.demo`. Every successful sign-in through the demo login form automatically calls the developer-only, same-origin `POST /api/dev-settings/onboarding-restart`, then opens `/onboarding`; no additional checkbox is required. The authenticated restart accepts only that onboarding identity and clears its children, reflections, observations, favorites, applications, Goals, and Goal uploads before restarting setup. Other identities are rejected and other accounts keep their data. New signup still creates an ordinary incomplete, resumable setup; it does not use this repeatable demo-tour behavior.

A versioned additive account-fixture upgrade makes the New User identity available in a retained development process without resetting existing accounts or repeatedly recreating a deleted account. Global fixture reset restores all five presets.

The demo onboarding service validates the same sequential steps, explicit children-later answer, approach/no-preference exclusivity, and completion requirements as the live API. State benefit samples mirror the API-owned templates for 50 states plus DC and match only the saved state. Empty simulation hides the benefit list without deleting preferences; setup settings stay usable.

Services/applications and Goals use account-owned mutable stores with matching status, pagination, conflict, active-child, media-limit, and follow-up behavior. Only the original populated User/Admin/SuperAdmin identities receive seeded applications/Goals/activity. The New User, onboarding identity, and newly registered users start without private activity. Global reset restores all new stores; the automatic onboarding restart clears only that demo account's setup, child/activity, application, and Goal/upload records. Goal demo media uses an existing tracked illustration and local byte readers, never S3. Each populated account has five distinct applications: two overdue follow-ups, one due today, and two due in five and seven days. The approved application retains its pending follow-up in the same dashboard grid. A versioned fixture upgrade adds the scenarios to retained processes while preserving user edits and deletions. The home commercial fixture has several eligible items and a six-second rotation interval.
