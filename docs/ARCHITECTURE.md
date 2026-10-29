# Architecture

GentlePath is one npm application. Domain services orchestrate requests; API clients handle transport; server adapters bridge the actual backend. There is no web repository/controller layer or generated API SDK.

## Source Map

| Owner                          | Responsibility                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `src/app/`                     | Routes, layouts, metadata, auth handlers, public reads, authenticated proxy             |
| `src/modules/<domain>/`        | Screens/components, hooks, domain services, feature models, demo/live adapters          |
| `src/services/`                | API/auth/session/runtime, shared demo dispatch, realtime, Messaging, analytics, privacy |
| `src/models/`                  | Shared schemas and types; transport-only models stay with their transport owner         |
| `src/clientContainer.ts`       | Browser service construction                                                            |
| `src/publicClientContainer.ts` | Optional-account article actions without protected-shell dependencies                   |
| `src/container.ts`             | Server construction and effective demo/live service selection                           |
| `src/components/ui/`           | Shared controls, layouts, interaction primitives                                        |
| `src/presentation/`            | Queued alerts, sheets, and toasts                                                       |
| `src/strings.ts`               | Every authored display string                                                           |

## Request And Trust Boundaries

**Screen → query/mutation hook → domain service → BrowserApiClient → `/api/backend/*` → trusted session → live adapter/API or DemoApiClient.**

Services accept `ApiClientInterface`, validate inputs/responses with Zod, and encode paths/query parameters. Browser input never establishes ownership or authorization. The proxy supplies credentials; canonical backend permissions and demo ownership checks remain independent of UI controls. See [integrations](INTEGRATIONS.md).

Root layout projects public runtime configuration. Protected layouts read the private session and pass a token-free `AppSession`; they do not write cookies. Route Handlers own refresh/cookie writes. `proxy.ts` gates navigation; API routes independently authenticate.

`getContainer()` caches separate live/demo containers but selects them from each request's effective server runtime. Auth, sessions, public article reads, proxying, and Messaging configuration use the same decision. Mode changes require a new session. A browser fixture flag never selects business behavior.

Public landing/blog routes stay outside the protected layout. Blog SSR uses published-only endpoints without session refresh. Optional article likes/saves use the public client container and an API client that does not redirect anonymous readers on 401.

## State Ownership

| State                                                         | Owner                               |
| ------------------------------------------------------------- | ----------------------------------- |
| Backend records, status, cache, invalidation                  | TanStack Query                      |
| Committed nonprivate filters, selection, paging               | URL                                 |
| Private journal search, forms, disclosure, pending UI         | Component state                     |
| Existing dashboard density/chrome                             | Zustand                             |
| Appearance/motion, consent, per-user push opt-in/registration | Preference services/browser storage |
| Demo records and credentials                                  | Server-process stores               |

Never put auth tokens or private drafts in browser storage. Use stable query keys containing every filter/page/identity that changes results. Pass AbortSignal through reads. Mutations invalidate authoritative detail/list keys and affected summaries; realtime invalidates those same keys. Logout clears account query data. Current defaults retain fresh reads for 30 seconds and inactive results for five minutes.

Client-only filters use Next's supported History API integration; filters consumed by server route props use router pushes. Both create history entries. Keep private searches out of URLs. Preserve safe mounted drafts during transient refetch failures; 401/403/404 remain authoritative.

## Models And Coding

Use strict TypeScript, descriptive camelCase values, PascalCase components, and the root Prettier configuration. Split independent schemas/models into files; keep an inferred type and directly derived inputs with their schema. Keep shared types in `src/models`, feature-only types in their module, and upstream DTOs in the owning API/server models directory.

Parse external data before use. Validate browser input for feedback and server input for trust. Show catalog-backed safe errors instead of unknown exceptions, raw upstream bodies, or secrets. Keep imports of environment, private sessions, and server containers out of client graphs; server integration files use `server-only`.

## Extend A Feature

1. Search for the closest existing model, service, hook, component, and string. [Feature requests](../src/modules/feature-requests/) is a small service/hook example; use the nearest domain for lifecycle rules.
2. Add the domain model/input and service method; register new services in the correct container. Routes compose screens rather than orchestrate API work.
3. Define stable query keys and mutation invalidation. Keep loading, retry, empty/no-results, pending, and successful states explicit.
4. If the browser facade differs from the actual API, add a server-only module adapter and register it in [featureBackendProxy](../src/services/api/featureBackendProxy.ts). Return `null` for unrelated paths. Preserve the backend's page contract and derive actor IDs from the trusted session.
5. Add matching demo operations, ownership/role validation, scenario behavior, and reset registration. Never simulate a live success by falling back to fixtures.
6. Reuse [shared UI](UI_SYSTEM.md), [centralized strings](STRINGS.md), and the [product lifecycle](GENTLEPATH.md). Run the applicable [verification](VERIFICATION.md).

Infrastructure integrations belong in `src/services/<capability>` and receive dependencies through a container. Document initialization, cancellation, retry, cleanup, and demo isolation. Interfaces are useful for actual alternative implementations, not as an extra abstraction around every class.
