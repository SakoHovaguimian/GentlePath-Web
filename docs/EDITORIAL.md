# Guided Steps And Editorial Resources

The editorial module implements the reviewed-content contract in the adjacent API repository, `../GentlePath-API/docs/REVIEWED_CONTENT_API.md`. It uses the existing domain service → API client → authenticated Next.js backend proxy pipeline. Browser code never receives credentials or calls the backend directly.

## Routes And Permissions

| Route                                           | Purpose                                                  | Access               |
| ----------------------------------------------- | -------------------------------------------------------- | -------------------- |
| `/guides`                                       | Search and page through guided steps                     | Signed-in accounts   |
| `/guides/{id}`                                  | Read ordered steps and source attribution; save a guide  | Signed-in accounts   |
| `/admin/guides`                                 | Guided-step directory                                    | Admin and Superadmin |
| `/admin/guides/new`, `/admin/guides/{id}`       | Create, edit, reorder, and delete a guide                | Admin and Superadmin |
| `/admin/resources`                              | Resource directory, type filter, and collection contents | Admin and Superadmin |
| `/admin/resources/new`, `/admin/resources/{id}` | Create, edit, move, and delete resources or collections  | Admin and Superadmin |
| `/resources`, `/resources/{id}`                 | Existing family library and resource details             | Signed-in accounts   |

Admin directories include links between Resources and Guided Steps. The existing admin layout checks roles on the server. The backend proxy independently checks `/admin/*` access. Demo handlers revalidate the active account and permissions before every request. Private family records are outside this module.

The reader's current step is local reading state. It does not record completion, assess a family, or claim clinical review. The shared `Stepper` shows the ordered contents without marking earlier steps complete. Saved guides use the engagement module's own favorite API.

## API Facades And Canonical Endpoints

`EditorialService` in `src/modules/editorial/services/editorialService.ts` uses these authenticated frontend facades:

| Facade                                                                    | Canonical API                                 |
| ------------------------------------------------------------------------- | --------------------------------------------- |
| `GET /portal/editorial/guides`, `GET /portal/editorial/guides/{id}`       | `GET /guided-steps`, `GET /guided-steps/{id}` |
| `POST /admin/editorial/guides`                                            | `POST /guided-steps`                          |
| `PUT /admin/editorial/guides/{id}`                                        | `PUT /guided-steps/{id}`                      |
| `PUT /admin/editorial/guides/{id}/items`                                  | `PUT /guided-steps/{id}/items`                |
| `PUT /admin/editorial/guides/{id}/items/order`                            | `PUT /guided-steps/{id}/items/order`          |
| `DELETE /admin/editorial/guides/{id}`                                     | `DELETE /guided-steps/{id}`                   |
| `GET /portal/editorial/resources`, `GET /portal/editorial/resources/{id}` | `GET /resources`, `GET /resources/{id}`       |
| `POST /admin/editorial/resources`                                         | `POST /resources`                             |
| `PUT /admin/editorial/resources/{id}`                                     | `PUT /resources/{id}`                         |
| `DELETE /admin/editorial/resources/{id}`                                  | `DELETE /resources/{id}`                      |

Lists retain the canonical `{ data, page: { limit, offset, hasMore, nextOffset } }` envelope. The UI defaults to nine records per page, keeps committed search/type/parent and paging in the URL, and offers previous, next, and first-page recovery through the shared pagination control. Resource parent choices load every collection page, exclude the edited collection and its known descendants, and retain the backend's final cycle check. Item order is saved as part of a complete guide replacement. The service also exposes the dedicated item-replacement and reorder endpoints.

`handleLiveEditorialRequest(request, path, forward, userId?)` is exported from `src/modules/editorial/server/handleLiveEditorialRequest.ts`. `BackendForward` comes from `src/services/api/models/backendForward.ts`. It returns `null` for unrelated routes. Reads can use either the portal or admin editorial prefix; writes require the admin prefix. The enclosing proxy and canonical backend supply authorization.

## Resource Library Bridge

The existing `PortalService` expects a family-facing resource model. The editorial live handler bridges `GET /portal/resources` to paginated `/resources` and the current account's `/favorites?content_type=RESOURCE`, then maps the two responses without introducing viewer-specific fields into canonical shared content. `POST /portal/resources/{id}/favorite` with `{ saved }` becomes an idempotent `PUT` or `DELETE /favorites/RESOURCE/{id}`. A direct `GET /portal/resources/{id}` is also supported.

The bridge preserves the existing library's four topics and three presentation formats. Canonical `type` and `format` remain separate in the editor. Optional `additional_properties.family_category` and `estimated_minutes` select the family topic and reading estimate; defaults are Everyday and five minutes. The library uses `additional_properties.body` when present for compatibility with existing demo articles, otherwise the canonical description is the body. Provenance, parent ID, canonical resource type, child count, and resource URL are optional extensions to the existing portal model, so older fixtures remain valid.

The live adapter and collection selector stop with an explicit error on nonadvancing pagination or more than 1,000 pages; they never return a silently truncated directory. All requests remain authenticated and uncached. Generalized favorites and ratings belong to the engagement module.

## Payloads, Attribution, And Validation

- Guide and resource titles accept 1–500 trimmed characters. Descriptions and guide item descriptions accept 1–20,000 trimmed characters.
- Guides contain 1–100 ordered items. Optional item titles use explicit `null`; new items omit `id`, retained items keep their UUID, and repeated or foreign item IDs are rejected. The server derives positions from array order. A reorder must include every current item ID exactly once.
- Guide parent fields are `title`, `description`, `image_url`, and `items`. Each item has `title`, `description`, `image_url`, and `additional_properties`. The guide API has no parent-level provenance field. The editor stores optional per-step `source_name`, `source_url`, and `source_published_at` within each item's metadata, preserves other metadata, and displays safe source links and dates in the reader.
- Resource replacement fields are `parent_id`, `type`, `format`, `tags`, `title`, `url`, `description`, and `resource_details`. All 24 canonical resource types and all nine canonical formats are supported; a format can be `null`.
- `resource_details` supports `source_name` (up to 300 characters), `source_url`, nullable date-only `source_published_at`, and `additional_properties`. Noncollection resources require both a source name and source URL. Publication dates cannot be in the future. Collections can omit sources.
- The backend assigns `reviewed_at` and `reviewed_by_user_id` from the current staff identity and server time on every resource write. The facade strips attempted client reviewer fields. Staff can read review attribution; member resource detail displays the review date without exposing the staff account ID. Editorial review is explicitly distinguished from a clinical assessment.
- Resource/source links accept HTTP(S), up to 1,000 characters, with no credentials, whitespace, control characters, or backslashes. Guide images require a permanent public HTTPS URL without query strings, fragments, credentials, encoded/private vault paths. Images have a bounded preview and accessible failure feedback.
- Tags allow up to 30 unique values, each 1–100 characters. Metadata must be a JSON object of at most 20,000 UTF-8 bytes, five nesting levels, at most 100 entries per object/array, keys of 1–100 characters, and string values of up to 10,000 characters.
- Resource parents must be available collections. Self-parenting and descendant cycles are rejected. A resource with children must remain a collection. Deleting a collection makes descendants unavailable through ancestry visibility while retaining their records and saved references.

Resource type, parent, source, and metadata validation is repeated by the backend. There is no revision or conditional-write contract for guides/resources; writes follow the canonical full-replacement semantics. Errors retain draft input and offer retry. The forms share field/error associations, first-invalid-field focus, guarded dirty/busy navigation, separate destructive confirmation, and mutation invalidation of editorial, portal, admin, and engagement caches. Native source publication-date inputs intentionally retain operating-system popup geometry and locale.

## Demo State And Verification

`handleEditorialRequest(request, path, session, context)` and `resetDemoEditorialState()` are exported from `src/modules/editorial/server/handleDemoEditorialRequest.ts`. The handler returns `null` for unrelated paths. The demo API client applies existing Loading/Error simulation before dispatch; the handler implements Empty directories without destroying content. Demo account/role/maintenance checks, item ownership, source dates, provenance assignment, collection moves, deletion visibility, and per-account favorites are enforced locally. No backend, Firebase, Messaging, Socket.IO, or analytics is required.

`demoEditorialState.ts` exports `getDemoEditorialState()`, `getVisibleDemoResources()`, `getVisibleDemoGuides()`, and `syncDemoPortalResources()`. Resource writes synchronize the existing `getDemoPortalState().resources`; its per-account `favorites` map remains authoritative for resource saves. This keeps authored content visible in the existing library and available to generalized engagement target resolution. Soft-hidden records remain outside visible lists. Reset clears the editorial process-local state; the next request reseeds it from the reset portal state. A process restart resets all content.

Focused HTTP verification against the isolated demo development server covered guide create/read/update retaining item IDs, dedicated reordering, duplicate order rejection, deletion, staff permissions, resource create appearing in the member library, favorite isolation, ignored reviewer spoofing, future source-date rejection, collection cycle/type guards, and descendant hiding on collection deletion. Temporary verification records were removed. Scoped editorial ESLint and `git diff --check` passed. The centralized strings checker had no editorial findings; unrelated concurrent work was still being completed when it ran. Parent integration owns final shared checks, the production web build, and browser QA. These demo checks do not establish live backend integration behavior. No tests or Xcode builds were added or run.
