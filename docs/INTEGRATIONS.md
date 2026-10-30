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

The browser sends login/signup to `POST /api/auth/session`. Server auth uses Firebase Identity Toolkit REST; signup also provisions the application account. Both actions require the authoritative `GET /users/profile` result before creating the session. Signup proceeds directly into the application after provisioning; email verification is not a completion step or a requirement for normal authenticated/realtime access. Token validation, disabled/deleted-account denial, database roles, ownership, registration controls, maintenance/community policy, and operator restrictions still apply. The web app never marks a Firebase identity verified.

`portal_session` contains encrypted tokens, expiry, and the minimal profile, with HTTP-only, SameSite Lax, path `/`, and production Secure flags. `AppSession` exposes user data and expiry only. Never serialize `ServerSession` to React, JSON, logs, URLs, analytics, or storage. Page navigation requires an unexpired access token, independently of the longer cookie lifetime. Login/signup validate the current identity before redirecting signed-in users; missing/expired sessions and failed identity checks leave the auth form available without rendering the protected shell. Landing-page auth links disable prefetch so redirect decisions use the session at navigation time.

Layouts only read sessions. Route Handlers refresh when expiry is near and retry upstream once after 401. Concurrent refreshes coalesce per token within one process; multi-instance invalidating providers may need shared coordination. Invalid refresh credentials clear the session; temporary network/server errors remain recoverable. SessionKeepAlive refreshes while the page is visible.

Profile updates refresh the trusted public profile. Email remains read-only until a verified identity-change workflow exists. Logout attempts push cleanup, disconnects realtime, clears the cookie/cache, and completes even if cleanup fails. Successful account deletion clears the cookie in the proxy; subsequent client push cleanup must skip another authenticated backend request.

## API Proxy And Mapping

[The backend route](../src/app/api/backend/[...path]/route.ts) verifies the session and mutation origin. It ignores browser bearer/ownership headers, adds server credentials and app-version, bounds upstream time, combines cancellation with the 30-second timeout, avoids redirects, and returns safe no-store responses. FormData passes through with its runtime-generated boundary; JSON stays JSON.

[Feature adapters](../src/services/api/featureBackendProxy.ts) receive an authenticated forwarding callback plus trusted user ID/role. They translate facade paths, field casing, commands, and pages to the sibling GentlePath API. Unknown paths fall through to normal forwarding, which does not imply that the backend implements them. Upstream `ADMIN`/`SUPER_ADMIN` map to frontend `admin`/`superadmin`; unrecognized roles receive ordinary family access. Permission denial is 403, not expired-auth 401.

Preserve each owning contract's page envelope: older portal services use arrays or `{data,total,limit,offset}`; newer canonical features use `{data,page:{limit,offset,hasMore,nextOffset}}`. Never silently truncate paginated data or substitute one shape for another. Maintain external DTOs and domain mappers with the service and adapter.

Journal facade `/portal/journals` maps through the portal journal adapter to owner-scoped canonical `/journals`: all list pages are read, detail/create/delete are mapped, and facade `PATCH` becomes canonical replacement `PUT`. Titles, body/message, child IDs, and the complete feelings array are retained; legacy untitled records receive a catalog-backed display title, and nullable dates/messages remain readable. Confirm the updated API schema and its reviewed migration prerequisites before live title writes; the private journal contract remains in the API's [family-record guide](../../GentlePath-API/docs/FAMILY_RECORDS_API.md). Browser drafts/search stay local; no journal contents become public or staff-readable.

**Retained live gaps:** the family adapter currently bridges only `GET /portal/children` to paged `/child-profiles`, with empty support notes because that backend model has no such field. Other legacy portal family writes/overview and generic dashboard tools must be implemented or explicitly adapted before claiming live support. Managed-user and platform administration use the canonical adapters described below. Inspect `PortalService`, `AdminService`, and the registered adapters. The family UI uses the new milestone-observation service; the old fixed-enum milestone methods are compatibility APIs.

The web portal does not expose the AI usage ledger. Its former facade and canonical ledger proxy paths return 404; the sibling API retains its internal ledger.

The backend's self-profile recovery endpoint bypasses maintenance only so the current identity can recover its application profile. It does not bypass active-account checks or grant access to other records. Public article/legal reads remain public. Password reset and provider-required verification for an email change remain separate security workflows; email is still read-only in this portal.

Live community/poll availability reads the canonical `/platform/status` community flag; authenticated backend policies enforce maintenance and community access independently of UI availability. Demo switches do not configure a production platform. The moderation bridge currently reads the newest 100 reports, groups In Review under Open in the staff UI, and submits `hide_target=false`; it is not a complete historical queue/hiding workflow.

Content tags are normalized at web/API inputs, filters, seed writes, and response boundaries: capitalize words, collapse whitespace, preserve acronyms/mixed-case names, and reject duplicate case variants. Review existing-row normalization as part of the API's existing-database rollout before relying on normalized live filters. Report evidence must remain unchanged.

## Realtime And Messaging

Live chat maps canonical `/chat-messages` HTTP pages and strict message writes to the existing display model; Older/Newer Messages controls retain pagination metadata. Own edit/delete service methods and demo ownership checks match the backend. Socket events invalidate queries rather than becoming another data store. Chat polls when sockets are unavailable. Demo uses local state/polling only.

Every Socket.IO connection/reconnection obtains a single-use ticket through `/api/backend/realtime/tickets`; the handshake sends `auth: {ticket}`, never a Firebase bearer. `rt:message` envelopes must pass [RealtimeMessageSchema](../src/services/realtime/models/realtimeMessage.ts). On connect, clients subscribe to the known `community` and `chat` channels through strict `rt:command` SUBSCRIBE envelopes. Clients cannot publish EVENT hints or join private rooms. Community hints invalidate post/poll queries; chat hints invalidate chat; private notification hints invalidate the inbox. Firebase/active-account status is revalidated by the server before delivery. Foreground delivery deduplicates event IDs. Existing FCM `portal_event` and demo notification payloads retain [RealtimeEventSchema](../src/services/realtime/models/realtimeEvent.ts) for safe title/body toast compatibility. Unmount/logout removes listeners and disconnects. SDK imports are deferred until needed.

The inbox and Appearance share browser notification controls. Only an explicit Enable Notifications action requests permission; login, inbox rendering, and timezone detection never do. Per-user browser choices distinguish undecided/enabled/off and use separate demo preference keys. Focus/storage refreshes reconcile browser permission changes. The inbox offers an undecided choice or an off warning, and the bell adds one setup alert until a decision is made, separately from unread inbox counts.

Firebase web identifiers configure `/firebase-messaging-sw.js`; FCM tokens register with `/devices`. Disable removes registration and deletes the token. Logout revokes registration while preserving the choice; account deletion forgets the choice. Device removal affects notification registration, not login sessions.

Send data-only FCM messages whose `data.portal_event` encodes the notification event. Foreground messages share validation/deduplication; background messages display safe title/body and use the event ID as their tag. The current background click destination is same-origin `/chat`. Never include credentials, HTML, or arbitrary external destinations. Delivery pruning and retries belong to the backend.

## Analytics And Consent

Amplitude loads only after explicit acceptance and never initializes in demo mode. The shared consent prompt offers essential-only and accept actions. Appearance does not expose analytics preferences. Same-tab events and storage events synchronize the preference.

Autocapture/default tracking are disabled. Current `screen_view` events omit queries/fragments, normalize UUID path segments, and attach no identity, email, form text, raw error, or token. Revocation immediately gates tracking, opts out/resets the SDK, and clears its storage; it cannot recall transmitted events. Analytics consent and browser notification permission are independent.

Commercial aggregate metrics use their own strict contract and never attach private family data or analytics identity. Ordinary browsing/preview does not automatically ingest those metrics. New analytics events need explicit reviewed fields, not arbitrary objects.

## Live Deployment Boundary

Read the sibling API's own AGENTS.md and maintained contracts before backend changes. Follow its [persistence and rollout contract](../../GentlePath-API/docs/STRUCTURED_BLOG_API.md#persistence) for the canonical prelaunch schema and pending forward migrations. Confirm the intended ledger/schema and pending forward migrations before live writes. Web builds do not apply migrations. Operator delivery tools additionally require the backend external-ID allowlist.

Configured staging must verify real database transactions/visibility, Firebase provisioning/refresh/authorization, private/public storage and retention, tickets/broadcasts, push/email delivery, consent, and provider behavior. A passing demo/build establishes none of these external integrations. Follow [verification](VERIFICATION.md); never run migration/seed/provider writes as a routine smoke check.

### Managed Accounts And Platform Availability

Live `/admin/users` and `/admin/settings` now adapt the API's canonical `/managed-users` and `/platform-settings` contracts. Managed reads keep seven persisted roles, while writes preserve the existing USER/ADMIN/SUPER_ADMIN assignment set and server-owned self/final-administrator guards. The directory adapter exhausts pages with monotonic offsets and an explicit bound; it never silently truncates the account list. No management route grants family-record access. Existing full private `/users` operator endpoints remain separate.

Public `/platform/status` contains only community, registration, and maintenance booleans. New live signup checks registration availability before creating a Firebase identity; the API checks again before application-account provisioning. Community/poll status facades read the real community flag. Live settings omit the demo-only resource-review switch because no separate approval lifecycle exists; resource saves still record their editorial reviewer/time. See the API's `docs/PLATFORM_OPERATIONS_API.md` and its unapplied managed-account/platform migration.

Poll transport preserves `voting_locked`, `expires_at`, and `is_expired` from the API. Existing question editing stays locked after ballot clearing, and expired poll voting closes while reading/results/own-ballot removal remain available. The Web editor does not invent a second expiry policy or overwrite omitted expiry fields.
