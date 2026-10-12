# New domain module

Read [architecture](../ARCHITECTURE.md), [conventions](../CONVENTIONS.md), [strings](../STRINGS.md), and the closest module.

Create `src/modules/<domain>/` with screens/components, query hooks, a domain service, and feature-only models as needed. Keep independent schemas/models in separate files. Reuse shared models in `src/models` and shared primitives in `src/components/ui`.

The service accepts `ApiClientInterface`, validates inputs, encodes route/query values, and maps transport responses to domain schemas. Register it in `ClientServiceContainer`. Routes only compose screens. Do not add repositories, controller adapters, or workspace packages.

Define stable query keys, pass cancellation where supported, invalidate related summaries after mutations, and provide loading/error/empty/success states. Put every authored label, error, metadata value, and accessible name in `src/strings.ts`.

Add matching demo endpoints with ownership, validation, paging, mutations, and current counts. Document live contracts and update AGENTS.md. Run static checks, demo build, and manual flows; do not write tests.

Follow [copy casing](../STRINGS.md#copy-casing): Title Case actions/CTAs, titles, field labels, navigation, table headers, options, and short statuses, including accessible action names. Capitalize every word while preserving acronyms and brand spelling. Keep descriptions, hints, and validation in sentence case; use semantic keys and reasoned annotations for exceptions. The catalog must pass `copy/title-case` and `check:strings`.
