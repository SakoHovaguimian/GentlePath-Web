# Architecture

GentlePath is one npm application. There are no workspace packages, generated API SDK, controller adapters, or repositories.

```text
src/app                   route composition, layouts, auth handlers, backend proxy
src/modules/<domain>      screens, hooks, domain services, domain-specific models
src/services              API, auth, session, demo, realtime, notifications, analytics, privacy
src/models                shared, independent domain schemas and types
src/clientContainer.ts    browser service construction
src/publicClientContainer.ts optional-account public article service construction
src/container.ts          server service construction and demo/live selection
src/components/ui         shared components and shell
src/presentation          canonical toast, alert, sheet service
src/strings.ts            all authored display copy
```

## Browser data flow

Screen → query/mutation hook → domain service → `BrowserApiClient` → `/api/backend/*` → session verification/refresh → live API or `DemoApiClient`.

Domain services validate mutation inputs, encode paths/query parameters, and map transport data to domain models. The proxy supplies authentication; browser-supplied ownership or authorization headers are never forwarded. The real backend remains authoritative for permissions. The demo API enforces current-user ownership itself.

The browser calls Firebase only for opt-in Messaging. It never receives access/refresh tokens or calls Firebase Authentication. Client code imports public session models, never server containers or environment.

## Server composition

Root layout passes only a public runtime configuration to `RuntimeProvider`. Protected layouts read the encrypted cookie and pass a token-free `AppSession` to `AppProviders`. They never write cookies. Query loading occurs through the browser proxy, which can safely refresh cookies in a Route Handler. `proxy.ts` provides navigation gating; API routes independently verify sessions.

`getContainer()` in `container.ts` selects separate cached live/demo service containers from the request’s effective server runtime. `DEMO_MODE` is the default; an HTTP-only preference can override it only in development or an explicitly enabled demo server. The root layout, encrypted session codec, auth routes, backend proxy, public blog adapter, and Messaging worker use that same decision. No browser fixture flag selects business behavior. Mode switches invalidate the old session. See [demo mode](DEMO_MODE.md).

Public `/` and `/blog` sit outside the authenticated layout. The public blog service uses the server API client and published-only endpoints without session tokens; authenticated editorial changes use the normal domain service → BrowserApiClient → backend proxy path. Developer configuration has a separate authenticated `/api/dev-settings` boundary, gated off in production live mode; recovery only enables demo routing and never grants identity or a role.

Public article likes and saves use a focused client container and query provider without mounting the protected shell. Its canonical API client disables automatic navigation on HTTP 401, allowing anonymous readers to receive a sign-in action while the article remains readable. Account writes still go through the authenticated proxy and never grant anonymous access. Public SSR remains independent of authentication.

## State ownership

- TanStack Query: server data, request status, cache and mutation invalidation.
- URL: committed filters, selected dashboard model, list query.
- Component state: forms, disclosure, pending UI.
- Zustand: existing dashboard density/chrome only; do not duplicate server data there.
- Local storage: appearance and motion, consent choice, per-user push opt-in and FCM registration identifier. Never auth tokens.
- Server process: demo records and demo credentials. Live data lives on the backend.

The custom UI system in `src/components/ui` includes the reusable LeafLaunch foundation. Theme CSS is canonical; preference services are constructed in the client container, and shared providers own appearance/motion/navigation/assistant presentation. Components receive callbacks; server data stays in domain services and query hooks. See [UI system](UI_SYSTEM.md) and [migration decisions](MIGRATION.md).
