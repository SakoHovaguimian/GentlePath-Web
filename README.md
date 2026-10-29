# GentlePath

A family workspace for private reflections, documents, and observations, with reviewed resources, community posts and polls, editorial publishing, family discounts, and role-based administration. Built as one Next.js / TypeScript application; [AGENTS.md](AGENTS.md) routes contributors to the relevant code and guidance.

## Run Locally

Requires Node 22 and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open [localhost:3001](http://localhost:3001). The sample environment enables demo mode. Sign-in offers Family Member, Admin, and SuperAdmin identities; [demo mode](docs/DEMO_MODE.md) documents credentials, scenarios, and reset behavior. Demo data persists in server memory across reloads and resets on restart. Use fictional data.

Development uses Webpack; optimized production builds use Turbopack. `/dev-settings` controls demo scenarios and latency. `/dev-settings/components` is the shared component reference.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development on port 3001 |
| `npm run check` | Lint, types, Next diagnostics, strings, semantic colors, shared controls, and Tailwind checks |
| `DEMO_MODE=true npm run build` | Optimized application build |
| `DEMO_MODE=true npm start` | Production demo preview on port 3001 |
| `git diff --check` | Whitespace/diff verification |

Use the development server for local HTTP browsing. Production cookies are Secure, including demo cookies; Safari needs trusted HTTPS for a production preview. Do not weaken cookie security to work around local sign-in.

## Configure Live Services

Set `DEMO_MODE=false`, configure the required values in [.env.example](.env.example), and restart. The server needs `PORTAL_API_URL`, `FIREBASE_WEB_API_KEY`, and a random `SESSION_SECRET` of at least 32 characters. Optional socket, Messaging, and analytics settings remain independent.

Read [integrations](docs/INTEGRATIONS.md) before connecting services. The backend remains authoritative for ownership, roles, persistence, and delivery. Feature adapters and some retained portal contracts differ; verify actual wiring. Structured publishing and tag normalization require their backend migrations. An unavailable live service never silently falls back to demo data.

## Documentation

[AGENTS.md](AGENTS.md) is the task index. [Product map](docs/GENTLEPATH.md) explains features and permissions; [architecture](docs/ARCHITECTURE.md) explains implementation ownership; [verification](docs/VERIFICATION.md) explains checks and live deployment limits. [DESIGN.md](DESIGN.md) records visual intent, while [UI system](docs/UI_SYSTEM.md) owns interaction and component contracts.
