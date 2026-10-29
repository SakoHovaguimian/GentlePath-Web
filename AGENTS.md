# Working On GentlePath

GentlePath is one Node 22 / npm application: Next.js 16, React 19, TypeScript, Tailwind v4, and TanStack Query. Exact versions and commands live in [package.json](package.json). This file is the entry point; read the guide for your task and the nearest implementation, then follow direct callers.

## Rules That Always Apply

- Preserve user changes. Do not create a worktree unless explicitly requested. Do not write tests. Do not run Xcode builds unless explicitly requested.
- Keep this one application. Reuse existing models, services, hooks, strings, and controls before adding equivalents. Do not add workspace packages or a repository/controller layer to the web app.
- Split independent models into separate files. A schema, its inferred type, and directly derived input schemas stay together.
- Follow **screen → query hook → domain service → API client → authenticated Next.js proxy**. Browser components never call the backend or Firebase Authentication directly.
- Keep credentials and private sessions server-only. React receives public user information and expiry, never access/refresh tokens. Firebase's browser SDK is for opt-in Messaging only.
- Enforce ownership and roles in the backend and demo handlers, independently of UI visibility. Staff permissions never expose another family's private records.
- Put every authored display string in [src/strings.ts](src/strings.ts), including metadata, errors, accessibility text, and demo copy. Use named formatters. No additional catalogs or inline copy.
- Use Title Case for actions, titles, labels, navigation, options, headers, and short statuses: capitalize every word, preserving acronyms and brands. Supporting prose and validation use sentence case. Follow [copy casing](docs/STRINGS.md#copy-casing).
- Reuse shared UI, semantic theme/motion tokens, and presentation services. Destructive/removal actions use the shared destructive variant. Preserve keyboard operation, drafts, browser history, and reduced motion.
- Keep `DEMO_MODE=true` independent of the backend, Firebase, sockets, Messaging, and Amplitude. Add matching validation, ownership, mutations, reset, and simulation behavior for new endpoints.
- Read the relevant installed Next.js documentation under `node_modules/next/dist/docs/` before changing framework APIs. This app uses `proxy.ts` and asynchronous cookies/params.

## Find The Right Owner

Read only the relevant section, then inspect the listed source. Directories below are search scopes, not instructions to load everything.

| Task                                                   | Guide                                                         | Start In                                                                                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Run/configure the app                                  | [README](README.md), [.env.example](.env.example)             | [package.json](package.json)                                                                                                                    |
| Add a feature, model, service, or query                | [Architecture](docs/ARCHITECTURE.md)                          | [client container](src/clientContainer.ts), [server container](src/container.ts), [feature-request example](src/modules/feature-requests/)      |
| Routes, roles, and feature behavior                    | [Product map](docs/GENTLEPATH.md)                             | [route tree](src/app/), [navigation](src/modules/portal/portalNavigation.tsx), owning module                                                    |
| API mapping, auth, sessions, realtime, push, analytics | [Integrations](docs/INTEGRATIONS.md)                          | [backend route](src/app/api/backend/[...path]/route.ts), [feature adapters](src/services/api/featureBackendProxy.ts), [services](src/services/) |
| Demo fixtures, scenarios, ownership, reset             | [Demo mode](docs/DEMO_MODE.md)                                | [dispatcher](src/services/demo/demoApiClient.ts), [reset route](src/app/api/dev-settings/reset/route.ts), module demo state                     |
| Blog builder, public SSR, uploads, JSONB               | [Blog](docs/BLOG.md)                                          | [blog module](src/modules/blog/)                                                                                                                |
| UI, layout, controls, interaction                      | [UI system](docs/UI_SYSTEM.md), [visual direction](DESIGN.md) | [shared UI](src/components/ui/), [theme](src/app/theme.css), [presentation](src/presentation/)                                                  |
| Copy, validation, accessibility names                  | [Strings](docs/STRINGS.md)                                    | [catalog](src/strings.ts), [checker](scripts/check-strings.mjs)                                                                                 |
| Verify or prepare live deployment                      | [Verification](docs/VERIFICATION.md)                          | affected flow, actual scripts, configured backend contracts                                                                                     |

For feature work, [GENTLEPATH.md](docs/GENTLEPATH.md) identifies each module, facade, permissions, and non-obvious lifecycle rules. The sibling `../GentlePath-API` owns persistence and canonical backend contracts. Read its own AGENTS.md before editing it; do not copy its repository architecture into this app.

## Carry A Change Through

1. Confirm the existing owner and actual container/route wiring. A demo endpoint or similarly named backend route is not proof of live integration.
2. Change the smallest complete path: models, service, query keys/invalidation, proxy mapping, matching demo behavior, and UI as applicable. Pass cancellation through reads; preserve inputs on failures.
3. Update the existing guide when ownership, routes, contracts, configuration, or shared behavior changes. Keep one source for each rule; fix stale links.
4. Verify the affected workflow and report actual results. Distinguish demo behavior from configured live integration.

## Finish And Maintain

- Source changes: `npm run check`. Application changes: also `DEMO_MODE=true npm run build` and focused demo browser/HTTP checks. Every change: `git diff --check`.
- Documentation-only changes need link/path and Markdown checks, not an application build.
- Use local demo data for routine verification. Do not send live analytics, notifications, or backend writes. Stop owned previews and remove synthetic records afterward.
- Keep docs about the current system. Consolidate into the guides above; do not add per-task plans, implementation diaries, copied API inventories, or growing verification logs. Update the compact current verification record instead.
