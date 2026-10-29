# AGENTS.md

GentlePath is a Node 22 / TypeScript web template using Next.js 16.2.10, React 19.2.4, Tailwind v4, and TanStack Query. It is one npm application. This file is the task index; detailed rules live in the linked guides.

## Standing rules

- Do not create a worktree unless explicitly requested.
- Do not write tests. Do not run Xcode builds unless explicitly requested. Verify with static checks, the web build, and focused manual workflows.
- Split independent models into separate files. Keep each schema, inferred type, and directly derived input schema together.
- All user-visible strings belong in the single [src/strings.ts](src/strings.ts) file, including labels, metadata, validation, errors, accessibility text, notifications, and static demo copy. Use named formatters for interpolation. Never place new display copy inline or create separate string catalogs.
- Use Title Case for actions, CTAs, page/section/dialog titles, field labels, navigation, table headers, options, and short status/toast titles. Capitalize every word, including A, And, Of, and To; preserve acronyms and brand spelling. Keep supporting prose, validation, and data in their appropriate case. Follow [copy casing and lint exceptions](docs/STRINGS.md#copy-casing); `copy/title-case` and `check:strings` enforce the catalog rule.
- Follow domain service → API client → authenticated Next.js backend proxy. Never call the backend or Firebase Authentication from browser components.
- Keep credentials and tokens server-only. Client session models contain user information only. The Firebase browser SDK is used for Messaging, never authentication.
- `DEMO_MODE=true` must work without a backend, Firebase, Socket.IO, Messaging, or Amplitude. Preserve demo ownership and validation rules when adding endpoints.
- Reuse the shared component library and semantic theme/motion tokens. `npm run check` enforces shared controls and theme-owned colors.
- Preserve user changes and the existing UI system. Search for a matching model, service, component, or string before creating one. Do not add workspace packages or a repository/controller layer.
- Read relevant installed Next.js docs under `node_modules/next/dist/docs/` before changing framework APIs; this project uses `proxy.ts` and asynchronous cookies/params.

## Read only what the task needs

Choose the matching rows below. Read the guide and nearest implementation, then follow direct callers and contracts. Explicit user instructions take precedence. Verify actual container wiring and scripts before assuming a feature is active. Repair stale links when found.

| When working on…                   | Read / inspect                                                                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Setup or adapting the template     | [Overview](README.md), [new project checklist](docs/NEW_PROJECT_CHECKLIST.md), [.env.example](.env.example)                                                              |
| Architecture and state ownership   | [Architecture](docs/ARCHITECTURE.md), [client container](src/clientContainer.ts), [server container](src/container.ts)                                                   |
| GentlePath features, roles, blog   | [Product/API/RBAC](docs/GENTLEPATH.md), [blog workflow](docs/BLOG.md), [portal](src/modules/portal/), [blog](src/modules/blog/)                                          |
| Vault, guided steps, saved content | [Document Vault](docs/DOCUMENT_VAULT.md), [editorial tools](docs/EDITORIAL.md), [ratings/likes/favorites](docs/ENGAGEMENT.md)                                            |
| Community, polls, milestones/tips  | [Community](docs/COMMUNITY.md), [polls](docs/POLLS.md), [milestone administration and history](docs/MILESTONE_ADMIN.md)                                                  |
| Commercial, inbox, operations      | [Commercial](docs/COMMERCIAL.md), [notifications](docs/NOTIFICATIONS.md), [account and operational tools](docs/ACCOUNT_TOOLS.md)                                         |
| New domain module                  | [Module guide](docs/prompts/NEW_MODULE_PROMPT.md), [feature requests](src/modules/feature-requests/)                                                                     |
| Foundational services              | [Service guide](docs/prompts/NEW_SERVICE_PROMPT.md), [services](src/services/)                                                                                           |
| Models, validation, API mapping    | [Conventions](docs/CONVENTIONS.md), [models](src/models/), [transport models](src/services/api/models/), [mappers](src/services/api/domainMappers.ts)                    |
| API routes and backend integration | [Backend contract](docs/BACKEND_CONTRACT.md), [proxy route](src/app/api/backend/[...path]/route.ts), [API client](src/services/api/apiClient.ts)                         |
| Authentication or session refresh  | [Auth guide](docs/AUTH.md), [auth service](src/services/auth/), [session service](src/services/session/)                                                                 |
| Demo fixtures and mutations        | [Demo guide](docs/DEMO_MODE.md), [demo API](src/services/demo/demoApiClient.ts), [demo state](src/services/demo/demoState.ts)                                            |
| Query hooks, caching, mutations    | [Query guide](docs/prompts/NEW_QUERY_HOOK_FAMILY_PROMPT.md), [query keys](src/queries/queryKeys.ts), [feature hooks](src/modules/feature-requests/hooks.ts)              |
| Chat, alerts, browser push         | [Realtime guide](docs/REALTIME.md), [provider](src/services/realtime/RealtimeProvider.tsx), [notification service](src/services/notifications/webNotificationService.ts) |
| Analytics and consent              | [Analytics guide](docs/ANALYTICS.md), [privacy services](src/services/privacy/), [analytics service](src/services/analytics/analyticsService.ts)                         |
| Copy, errors, accessibility labels | [Strings rules](docs/STRINGS.md), [strings file](src/strings.ts), [static checker](scripts/check-strings.mjs)                                                            |
| UI, themes, shared controls        | [UI system](docs/UI_SYSTEM.md), [Design context](DESIGN.md), [behavior contract](UX-CONTRACT.md), [shared UI](src/components/ui/), [presentation](src/presentation/)     |
| Verification and continuity        | [Conventions](docs/CONVENTIONS.md), [migration notes](docs/MIGRATION.md), [verification record](docs/VERIFICATION.md)                                                    |

## Verify and maintain

- Run `npm run check` for source changes and `DEMO_MODE=true npm run build` for application changes. Run `git diff --check` for every change.
- Exercise affected flows in the browser. Use local demo data; do not send live analytics, notifications, or backend writes as routine verification.
- Report actual checks and distinguish demo verification from live integration verification.
- Update affected docs when routes, contracts, environment, ownership, or wiring change. Keep this index short; place details in a focused guide and link it here.
