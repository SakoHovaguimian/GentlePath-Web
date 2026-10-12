# New project checklist

1. Read [AGENTS.md](../AGENTS.md) and [architecture](ARCHITECTURE.md). Use Node 22 and npm.
2. Copy `.env.example` to `.env.local`; run the demo before adding external dependencies.
3. Update product identity and all copy through `src/strings.ts`. Keep token ownership in [DESIGN.md](../DESIGN.md).
4. Open `/dev-settings/components`; choose theme defaults and reuse the shared controls, motion, page patterns, and mobile layouts. Read [UI system](UI_SYSTEM.md).
5. Set a strong live session secret and Firebase web API key. Never add Firebase Admin to the frontend or browser auth tokens.
6. Align the backend with [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md); adapt domain services and demo routes together.
7. Add domain modules with independent models and query keys. Register services in the correct container.
8. Configure optional socket, Messaging, and Amplitude values. Verify consent, permissions, cleanup, and demo isolation.
9. Run `npm run check`, `DEMO_MODE=true npm run build`, and focused browser flows. Do not write tests or run Xcode builds.
10. Record verified external integrations and remaining deployment configuration. Update the agent index and focused guides.
