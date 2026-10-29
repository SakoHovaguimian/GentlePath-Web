# Integrations

The browser talks to same-origin Next.js routes. The server owns authentication, credentials, backend forwarding, and runtime selection. [Architecture](ARCHITECTURE.md) describes composition; [product behavior](GENTLEPATH.md) identifies domain adapters.

## Configuration

[.env.example](../.env.example) is the complete configuration reference.

| Setting                                   | Purpose                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `DEMO_MODE`                               | Server default for isolated demo versus live services                  |
| `PORTAL_API_URL`, `APP_VERSION`           | Backend base URL including its prefix, plus forwarded version          |
| `SESSION_SECRET`, `FIREBASE_WEB_API_KEY`  | Required live encrypted-session secret and Firebase REST configuration |
| `PORTAL_APP_ORIGIN`                       | Canonical public origin when an ingress changes request origin         |
| `PORTAL_SOCKET_URL`                       | Optional browser-reachable Socket.IO origin                            |
| Firebase web configuration / VAPID values | Optional Messaging public identifiers, never Admin credentials         |
| `AMPLITUDE_API_KEY`                       | Optional public analytics project key; explicit consent still required |

Live sessions require a random secret of at least 32 characters. Rotating it signs users out. Never expose backend URLs, private keys, refresh tokens, or backend storage credentials through public config. S3 and provider management credentials belong to the backend.

## Authentication And Sessions

The browser sends login/signup to `POST /api/auth/session`. Server auth uses Firebase Identity Toolkit REST; signup also provisions the application account. Login requires the authoritative `GET /users/profile` result, not merely a Firebase identity.

`portal_session` contains encrypted tokens, expiry, and the minimal profile, with HTTP-only, SameSite Lax, path `/`, and production Secure flags. `AppSession` exposes user data and expiry only. Never serialize `ServerSession` to React, JSON, logs, URLs, analytics, or storage. Auth layouts validate current identity before redirecting signed-in users, avoiding disabled-account redirect loops.

Layouts only read sessions. Route Handlers refresh when expiry is near and retry upstream once after 401. Concurrent refreshes coalesce per token within one process; multi-instance invalidating providers may need shared coordination. Invalid refresh credentials clear the session; temporary network/server errors remain recoverable. SessionKeepAlive refreshes while the page is visible.

Profile updates refresh the trusted public profile. Email remains read-only until a verified identity-change workflow exists. Logout attempts push cleanup, disconnects realtime, clears the cookie/cache, and completes even if cleanup fails. Successful account deletion clears the cookie in the proxy; subsequent client push cleanup must skip another authenticated backend request.

## API Proxy And Mapping

[The backend route](../src/app/api/backend/[...path]/route.ts) verifies the session and mutation origin. It ignores browser bearer/ownership headers, adds server credentials and app-version, bounds upstream time, combines cancellation with the 30-second timeout, avoids redirects, and returns safe no-store responses. FormData passes through with its runtime-generated boundary; JSON stays JSON.

[Feature adapters](../src/services/api/featureBackendProxy.ts) receive an authenticated forwarding callback plus trusted user ID/role. They translate facade paths, field casing, commands, and pages to the sibling GentlePath API. Unknown paths fall through to normal forwarding, which does not imply that the backend implements them. Upstream `ADMIN`/`SUPER_ADMIN` map to frontend `admin`/`superadmin`; unrecognized roles receive ordinary family access. Permission denial is 403, not expired-auth 401.

Preserve each owning contract's page envelope: older portal services use arrays or `{data,total,limit,offset}`; newer canonical features use `{data,page:{limit,offset,hasMore,nextOffset}}`. Never silently truncate paginated data or substitute one shape for another. Maintain external DTOs and domain mappers with the service and adapter.

**Retained live gaps:** the family adapter currently bridges only `GET /portal/children` to paged `/child-profiles`, with empty support notes because that backend model has no such field. Other legacy portal family writes/journals/overview, generic dashboard tools, and platform/user administration contracts must be implemented or explicitly adapted before claiming live support. Inspect `PortalService`, `AdminService`, and the registered adapters. The family UI uses the new milestone-observation service; the old fixed-enum milestone methods are compatibility APIs.

Protected core backend routes now require a verified Firebase email. Account provisioning remains identity-only and self-profile reads support unverified account recovery; public article/legal reads remain public.

The backend has no matching community/maintenance platform-policy endpoint. Live community/poll availability reports enabled and relies on actual backend authorization. Demo switches do not configure a production platform. The moderation bridge currently reads the newest 100 reports, groups In Review under Open in the staff UI, and submits `hide_target=false`; it is not a complete historical queue/hiding workflow.

Content tags are normalized at web/API inputs, filters, seed writes, and response boundaries: capitalize words, collapse whitespace, preserve acronyms/mixed-case names, and reject duplicate case variants. Deploy the tag backfill migration before relying on normalized live filters against existing rows. Report evidence is not rewritten by the backfill.

## Realtime And Messaging

Live chat maps canonical `/chat-messages` HTTP pages and strict message writes to the existing display model; Older/Newer Messages controls retain pagination metadata. Own edit/delete service methods and demo ownership checks match the backend. Socket events invalidate queries rather than becoming another data store. Chat polls when sockets are unavailable. Demo uses local state/polling only.

Every Socket.IO connection/reconnection obtains a single-use ticket through `/api/backend/realtime/tickets`; the handshake sends `auth: {ticket}`, never a Firebase bearer. `rt:message` envelopes must pass [RealtimeMessageSchema](../src/services/realtime/models/realtimeMessage.ts). On connect, clients subscribe to the known `community` and `chat` channels through strict `rt:command` SUBSCRIBE envelopes. Clients cannot publish EVENT hints or join private rooms. Community hints invalidate post/poll queries; chat hints invalidate chat; private notification hints invalidate the inbox. Firebase/active-account status is revalidated by the server before delivery. Foreground delivery deduplicates event IDs. Existing FCM `portal_event` and demo notification payloads retain [RealtimeEventSchema](../src/services/realtime/models/realtimeEvent.ts) for safe title/body toast compatibility. Unmount/logout removes listeners and disconnects. SDK imports are deferred until needed.

Appearance owns the explicit Enable Notifications action. Neither login, inbox rendering, nor timezone detection requests permission. Saved opt-in restores only for that account. Firebase web identifiers configure `/firebase-messaging-sw.js`; FCM tokens register with `/devices`. Disable removes registration and deletes the token. Device removal affects notification registration, not login sessions.

Send data-only FCM messages whose `data.portal_event` encodes the notification event. Foreground messages share validation/deduplication; background messages display safe title/body and use the event ID as their tag. The current background click destination is same-origin `/chat`. Never include credentials, HTML, or arbitrary external destinations. Delivery pruning and retries belong to the backend.

## Analytics And Consent

Amplitude loads only after explicit acceptance and never initializes in demo mode. Essential-only and accept actions are equally reachable; Appearance can change consent. Same-tab events and storage events synchronize the preference.

Autocapture/default tracking are disabled. Current `screen_view` events omit queries/fragments, normalize UUID path segments, and attach no identity, email, form text, raw error, or token. Revocation immediately gates tracking, opts out/resets the SDK, and clears its storage; it cannot recall transmitted events. Analytics consent and browser notification permission are independent.

Commercial aggregate metrics use their own strict contract and never attach private family data or analytics identity. Ordinary browsing/preview does not automatically ingest those metrics. New analytics events need explicit reviewed fields, not arbitrary objects.

## Live Deployment Boundary

Read the sibling API's own AGENTS.md and maintained contracts before backend changes. Deploy its required structured-blog and tag-normalization migrations against the intended database through the normal release process; web builds do not apply migrations. Operator delivery/AI tools additionally require the backend external-ID allowlist.

Configured staging must verify real database transactions/visibility, Firebase provisioning/refresh/authorization, private/public storage and retention, tickets/broadcasts, push/email delivery, consent, and provider behavior. A passing demo/build establishes none of these external integrations. Follow [verification](VERIFICATION.md); never run migration/seed/provider writes as a routine smoke check.


### Managed Accounts And Platform Availability

Live `/admin/users` and `/admin/settings` now adapt the API's canonical `/managed-users` and `/platform-settings` contracts. Managed reads keep seven persisted roles, while writes preserve the existing USER/ADMIN/SUPER_ADMIN assignment set and server-owned self/final-administrator guards. The directory adapter exhausts pages with monotonic offsets and an explicit bound; it never silently truncates the account list. No management route grants family-record access. Existing full private `/users` operator endpoints remain separate.

Public `/platform/status` contains only community, registration, and maintenance booleans. New live signup checks registration availability before creating a Firebase identity; the API checks again before application-account provisioning. Community/poll status facades read the real community flag. Live settings omit the demo-only resource-review switch because no separate approval lifecycle exists; resource saves still record their editorial reviewer/time. See the API's `docs/PLATFORM_OPERATIONS_API.md` and its unapplied managed-account/platform migration.

Poll transport preserves `voting_locked`, `expires_at`, and `is_expired` from the API. Existing question editing stays locked after ballot clearing, and expired poll voting closes while reading/results/own-ballot removal remain available. The Web editor does not invent a second expiry policy or overwrite omitted expiry fields.
