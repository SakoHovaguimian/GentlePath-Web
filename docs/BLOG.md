# GentlePath Journal

The public journal is available at `/blog` and `/blog/[slug]`. It does not require a session. Only published articles appear in public results or detail reads. The public reader renders safe Markdown with ordered content, headings, quotes, lists, and links through the shared `MarkdownContent` component. Public publication dates resolve in the reader’s browser timezone through the shared timezone hook; server rendering uses an ISO date until that snapshot is available. Cover illustrations are selected from the bundled GentlePath artwork.

Administrators and super administrators manage articles at `/admin/blog`, `/admin/blog/new`, and `/admin/blog/[id]`. A new article begins as a draft. Editors can preview the current form privately, save a draft, publish, return a published article to draft, or delete it. Saves on an already published article update the public article immediately; the form explains this behavior. Publication changes and deletion use the shared confirmation dialog. Unsaved forms use the shared navigation guard.

## Data And Validation

`src/modules/blog/models/` owns independent article, category, cover, status, query, page, and form error models. The article schema includes `id`, unique `slug`, `title`, `description`, `author`, Markdown `body`, `category`, `cover`, `status`, `createdAt`, `updatedAt`, nullable `publishedAt`, and integer `revision`.

The editor and API validate title (3–140 characters), slug (3–100 lowercase letters, numbers, or single hyphen separators), introduction (20–350), author (2–100), and body (40–50,000). Category and cover values are validated enums. All authored text, including fixture articles, is in `src/strings.ts` under `gentlePathBlogStrings`.

Mutations carry the last observed `revision`. Successful mutations increment it. A stale revision returns HTTP 409, preserving the editor's writing and explaining how to review the latest version. Slug collisions return HTTP 400. The demo deletes records from its process state; the confirmation explains that deletion cannot be undone.

## API Contract

Browser management follows screen → TanStack Query hook → `BlogService` → `BrowserApiClient` → authenticated `/api/backend/*` proxy. Server-side permissions require an administrator or super administrator. Live backends must independently enforce these permissions and the same validation and revision rules.

| Upstream Path         | Method | Result                                                            |
| --------------------- | ------ | ----------------------------------------------------------------- |
| `/blog`               | GET    | Administrative article page, including drafts                     |
| `/blog`               | POST   | Create a draft from article mutation input; HTTP 201              |
| `/blog/:id`           | GET    | Administrative article detail                                     |
| `/blog/:id`           | PATCH  | Save mutation input including `revision`                          |
| `/blog/:id`           | DELETE | Delete with body `{ revision }`; HTTP 204                         |
| `/blog/:id/publish`   | POST   | Publish with body `{ revision }`                                  |
| `/blog/:id/unpublish` | POST   | Return to draft with body `{ revision }`                          |
| `/public/blog`        | GET    | Published article page only                                       |
| `/public/blog/:slug`  | GET    | Published article detail; drafts/missing articles return HTTP 404 |

List query fields: `query`, optional `category`, optional administrative `status`, `limit` (1–50), and `offset` (zero-based). Public pages default to six records and management pages to ten. Responses are `{ data, total, limit, offset }`; responses use article domain fields in camelCase. Paging is clamped after filtering or deletion. Public APIs ignore administrative status filters. Categories are `family`, `community`, `practical`, and `stories`; covers are `family`, `community`, `journal`, `growth`, `folder`, and `path`.

The safe Next.js public endpoint is `/api/public/blog/[[...path]]` (GET only). Public SSR uses the same server-only `publicBlogService`, selecting demo or `ApiClient` through the request's effective runtime. Public reads never inspect or refresh an authentication session. External payloads are parsed with Zod, and the service refuses to render draft payloads from a live upstream.

## Demo Ownership

`handleDemoBlogRequest(request, path, actor)` in `src/services/demo/demoBlogApi.ts` enforces administrator roles for all management reads and mutations, validates payloads, and implements the public published-only contract. Its `actor` is a server session projection; browser ownership or role headers are never accepted. `getDemoBlogState()` returns the process-owned article array; `resetDemoBlogState()` restores the eight fixtures (seven published, one draft).

Development request preferences control demo/live routing and populated, loading, empty, and error states. Public empty mode returns an empty list and HTTP 404 details. The administrative wrapper applies the same simulation before dispatch. Demo state survives reloads and resets on process restart or the explicit developer reset control. It has no external writes, analytics, notification delivery, or storage service dependency.

## Verification

Do not write tests. Run the repository static checks and demo build, then manually exercise public filters/paging, article reading, a complete administrative draft/publication lifecycle, draft access rejection, revision conflicts, and validation. Use demo records only; live backend integration requires the documented endpoints and independently configured authorization.
