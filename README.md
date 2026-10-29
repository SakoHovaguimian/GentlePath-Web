# GentlePath

A single npm application built with Next.js **16.2.10**, React **19.2.4**, strict TypeScript, Tailwind CSS v4, and TanStack Query. Domain modules call an API client through an authenticated Next.js backend proxy. Shared React Aria/Radix UI primitives and GentlePath’s light/dark accent themes live in the same application.

## Start with the demo

Requires Node 22.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3001. The development script uses Next.js Webpack because the installed Turbopack development CSS resolver resolves relative stylesheet imports from the repository root; the optimized production build still uses Turbopack. The sample environment sets `DEMO_MODE=true`. Choose Family Member, Admin, or SuperAdmin on the sign-in screen. Seed accounts are `user@gentlepath.demo`, `admin@gentlepath.demo`, and `superadmin@gentlepath.demo`; all use `password123`. You can also create a demo family account. Demo mutations are stored in server memory across navigation and reloads; restarting the server restores fixtures.

Demo mode includes family profiles, private journals, resources and favorites, per-child observations, role-aware dashboards, a complete blog publishing workflow, people and moderation operations, and SuperAdmin platform settings. `/dev-settings` controls server-backed populated/loading/empty/error scenarios, response latency, trusted demo role switching, and fixture reset. Public visitors start at `/`; sign in to open `/dashboard` or `/admin`. It makes no Firebase, backend, Socket.IO, Messaging, or Amplitude calls. Optional analytics and browser push controls explain their demo state.

## Component foundation

Open `/dev-settings/components` after signing in. GentlePath includes the LeafLaunch shared component foundation, mobile navigation and record layouts, animated segmented controls, horizontal/vertical steppers, persistent panels, Markdown editing, media previews, and shared light/dark/accent/motion settings. Previews stay local. Read [UI system](docs/UI_SYSTEM.md) before extending a screen.

## Live mode

Set `DEMO_MODE=false`, provide `PORTAL_API_URL`, `FIREBASE_WEB_API_KEY`, and a random `SESSION_SECRET` of at least 32 characters, then restart. `PORTAL_API_URL` includes the backend prefix, such as `http://localhost:3000/api`. Configure optional Socket.IO, Firebase Messaging, and Amplitude values from [.env.example](.env.example).

The backend must implement the [documented contract](docs/BACKEND_CONTRACT.md). This frontend does not create backend chat, ticket, device, or business endpoints. Missing live integrations are not silently replaced with demo data.

Authentication uses Firebase REST on the server. Access and refresh tokens live in an encrypted HTTP-only session cookie. Browser calls use `/api/backend/*`; the proxy refreshes tokens and forwards the bearer and app-version headers. Socket.IO uses short-lived tickets. Firebase Messaging is explicitly opt-in. Amplitude loads only after consent; no Sentry frontend integration is included.

## Commands

```sh
npm run dev
npm run check
DEMO_MODE=true npm run build
DEMO_MODE=true npm start
npm run check:strings
```

Use `npm run dev` for local HTTP browsing. `npm start` enables production `Secure` cookies; Safari requires HTTPS to retain them, including demo sessions. See [demo sign-in troubleshooting](docs/DEMO_MODE.md).

The repository contains no tests by instruction. `check` runs ESLint with zero warnings allowed, route-aware TypeScript, Next.js editor plugin diagnostics, display-string checks, semantic-color checks, shared-control checks, and Tailwind canonical-class checks. Keep the npm lockfile committed.

## Find your way around

- [AGENTS.md](AGENTS.md): concise agent landing page and task index.
- [GentlePath routes, RBAC, and API](docs/GENTLEPATH.md), [blog publishing](docs/BLOG.md).
- [Architecture](docs/ARCHITECTURE.md): modules, services, browser/server boundaries, state ownership.
- [Demo mode](docs/DEMO_MODE.md), [authentication](docs/AUTH.md), [realtime](docs/REALTIME.md), [analytics](docs/ANALYTICS.md).
- [Strings](docs/STRINGS.md): all display copy is centralized in `src/strings.ts`.
- [New project checklist](docs/NEW_PROJECT_CHECKLIST.md), [migration notes](docs/MIGRATION.md).
- [Design](DESIGN.md), [UX contract](UX-CONTRACT.md), [verification](docs/VERIFICATION.md).
