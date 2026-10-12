# Implementation conventions

Use strict TypeScript, descriptive camelCase values, PascalCase React components, single quotes, semicolons, and trailing commas. The root Prettier configuration is canonical. Keep unrelated formatting out of small changes.

Split independent models into individual files. A Zod schema, its inferred type, and directly derived mutation schema may share a file. A small barrel may re-export models without defining another copy. Shared models live in `src/models`; feature-only models live under the owning module; transport DTOs live under `services/api/models`.

Before introducing a helper, service, model, string, or component, search for an existing equivalent. Domain services own domain request orchestration. Infrastructure services own integrations. Containers own construction. Screens render domain models and call query hooks; no direct backend URLs, credentials, Firebase auth calls, or duplicated fetch logic.

Use the public session for display only. Permission checks and ownership belong to the backend and demo API. Parse external data with Zod before using it. Reject malformed input without exposing secrets, raw upstream responses, tokens, or stack traces. Validate browser input for feedback and server input for trust boundaries.

Reuse `Button`, `Field`, `Input`, `QueryBoundary`, and `PresentationProvider`. Keep form data on failure, disable duplicate submits, show inline errors, and confirm destructive actions through the shared alert. Use semantic theme classes and all copy from [strings](STRINGS.md). Native date input is the chosen profile control; OS locale/geometry is accepted.

Author actions, headings, field labels, navigation, table headers, options, and short statuses in Title Case. Use sentence case for supporting prose and validation. Follow the [copy casing rules](STRINGS.md#copy-casing) when naming catalog keys or documenting exceptions; ESLint and the string checker enforce them.

## Verification

Do not write tests. Run `npm run check`, `DEMO_MODE=true npm run build`, and `git diff --check`. Use the demo for browser and HTTP smoke checks. Do not run Xcode builds unless explicitly asked. Do not make live writes, trigger browser permission prompts, or emit production analytics as generic verification.

For a service change, verify real wiring, error recovery, demo behavior, and cleanup. For a UI change, inspect desktop and narrow widths, loading/error/empty/success states, keyboard behavior, and a sibling screen. Record what was actually checked and what needs configured external services.

## Continuity

Update [AGENTS.md](../AGENTS.md) links for new capabilities. Update the backend contract when paths or payloads change, the sample environment for new configuration, and focused docs for ownership/lifecycle decisions. Do not carry forward old pnpm, workspace, controller, repository, Firebase Admin, Sentry, or generated SDK instructions.
