# Authentication and sessions

The authentication layout reads the current trusted public session and redirects signed-in accounts to their role’s workspace. The navigation proxy does not redirect away from sign-in based only on an encrypted cookie: a disabled or removed demo identity must be allowed to reach sign-in without a redirect loop.

The browser submits email/password to `POST /api/auth/session` with `action: login` or `action: signup`. The server validates input and calls Firebase Identity Toolkit REST. Signup also provisions the application user on the backend. Login obtains the authoritative application profile from `GET /users/profile`. A Firebase account alone is insufficient without its backend profile; provisioning failures must be resolved before that account can sign in.

The session cookie `portal_session` contains Firebase access/refresh tokens, their expiry, and the minimal public user profile. `jose` encrypts it using direct AES-256-GCM with a key derived from `SESSION_SECRET`; the JWT also has a 30-day expiry. Cookie flags are HTTP-only, same-site lax, path `/`, and secure in production. Live mode requires a random secret of at least 32 characters. Rotating it signs users out. Oversized cookies are rejected before writing.

`AppSession` contains user display data and expiry only. Never serialize the private `ServerSession`, token, or refresh token to React props, JSON responses, browser storage, logs, URLs, or analytics. Old signed `semantic_web_session` cookies are ignored after migration.

## Refresh lifecycle

- Server layouts read sessions only; cookie writes are restricted to Route Handlers.
- The backend proxy refreshes when fewer than five minutes remain, and retries once after a backend 401.
- Refresh calls coalesce per refresh token within a process and briefly retain results for concurrent requests. Multi-instance deployments may need a shared refresh coordinator if their identity provider invalidates reused refresh tokens.
- Invalid refresh credentials clear the cookie. Network/server failures return a recoverable error without discarding the session.
- `SessionKeepAlive` refreshes through the session route on visibility and every five minutes while visible.
- A final 401 clears the client cache on sign-out/navigation and returns the user to sign-in with an internal return path.

All mutation routes reject cross-origin browser requests. Set PORTAL_APP_ORIGIN to the public origin when an ingress changes the request origin. The forwarding proxy ignores incoming authorization headers, supplies the session token itself, encodes path segments, avoids following redirects, and forwards only selected headers. The backend must still enforce every business permission and protect auth endpoints from abuse.

Profile editing updates names, phone, and date of birth. Email is read-only because changing Firebase identity requires a separate verified flow. After profile updates, the session route reloads the trusted backend profile; it does not trust names/roles submitted by the browser. Logout first attempts to revoke this browser’s push registration, then clears the cookie and query data. Push cleanup is best effort: an unavailable notification service must not prevent clearing the session.

## GentlePath roles

The trusted backend user transport includes `role: user | admin | superadmin`; missing roles default to user. Browser input never selects a live role. User/session schemas preserve this trusted value for navigation, while proxy routes and the backend enforce permissions. Demo session reads revalidate the current account, disabled/deleted state, and role against process-owned account records. Developer role changes sign in a seeded demo identity and issue a new encrypted session; they are unavailable in production live mode. See [GENTLEPATH.md](GENTLEPATH.md) and [DEMO_MODE.md](DEMO_MODE.md).
