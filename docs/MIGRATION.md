# Migration and continuity

The October 2026 migration adopts the JobLens-style runtime architecture while preserving Portal’s product surfaces and design system.

| Previous                                          | Current                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| pnpm workspaces and Turborepo                     | One root npm package and lockfile                                |
| Next 15 / React 19 range                          | Next 16.2.10 / React 19.2.4 pinned                               |
| apps/web and packages/*                           | src/app, src/modules, src/services, src/components               |
| Controllers/services/repositories/generated SDK   | Domain services, API clients, authenticated backend proxy        |
| Browser Firebase Auth + Admin SDK                 | Server Firebase REST + encrypted HTTP-only token session         |
| Always-mocked browser/server repositories         | One server-only DEMO_MODE switch and process-local mutable state |
| Signed semantic_web_session cookie                | Encrypted portal_session cookie; old sessions sign in again      |
| NEXT_PUBLIC_ENABLE_MOCK_AUTH and browser API base | DEMO_MODE and server-only PORTAL_API_URL                         |
| Frontend Sentry                                   | Consent-gated Amplitude; monitoring remains on backend           |
| Inline copy                                       | One src/strings.ts file and a static check                       |

## Deliberate continuity decisions

- Retain React Aria/Radix UI, Tailwind v4 tokens, PresentationProvider, and light/dark/accent behavior. Astryx adoption was not part of the requested migration.
- Retain Zustand only for dashboard density. TanStack Query owns API state.
- Replace server-side mock prefetch with browser queries through the proxy. This keeps refresh cookie writes in Route Handlers and prevents divergent browser/server mock state.
- Keep independent domain and transport models; remove OpenAPI generation and workspace package imports.
- Existing chart examples are demo-only. Business counts and records use the selected API mode.
- Profile email is read-only until a dedicated Firebase identity-change flow is implemented.
- The generic Portal chat/ticket/device contracts must be implemented or adapted on a real backend. No backend repository was changed by this migration.

After pulling, run `npm ci`, recreate `.env.local` from the sample, set live values when needed, and restart from the repository root. Existing ignored workspace caches may be deleted locally when no longer needed; they are not part of the application or committed source.

## LeafLaunch UI foundation — October 12, 2026

Portal adopts the reusable LeafLaunch controls and patterns in the existing npm application. It retains Portal routes, domain services, public sessions, server-only credentials, and demo isolation. `/dev-settings/components` joins the authenticated route matcher and allowed login return paths. `/experience` remains available.

The runtime palette is consolidated into theme.css; semantic-tokens.css is retired. Aqua remains the default and Leaf green is optional. Selection opacity now uses the active accent and distinct light/dark alpha rather than a fixed mint base. Shared motion, persistent segmented panels, full-screen mobile navigation, responsive records, Markdown, media previews, and horizontal/vertical steppers form the base for future projects.

The Button content wrapper was corrected to preserve composed grid/flex layouts such as Stepper and SectionCardView; loading still retains geometry and accessible text. Models stay separate, copy stays centralized, and the repository now enforces shared controls and theme-owned colors. See [UI system](UI_SYSTEM.md).
