# Private Document Vault

The authenticated `/documents` screen lets each account upload, organize, download, and delete its own documents. It reuses the GentlePath portal shell, illustrated banner, shared controls, confirmations, query boundaries, and dirty-form guard. Platform roles do not grant access to another account's documents.

## Ownership And Transport

Browser screen → document hooks → `DocumentVaultService` → `BrowserApiClient` → authenticated `/api/backend/portal/documents` proxy. The service receives `ApiClientInterface`; containers own construction. File upload uses `FormData`, which the browser API client sends without setting a JSON content type. API credentials remain on the server.

`handleLiveDocumentVaultRequest` translates the web facade to the existing backend's private `/care-documents` routes. Its injected `forward(request, path)` callback uses the normal authenticated upstream proxy and refresh/retry boundary. Upstream storage keys never appear in browser models. The backend stores an opaque key instead of the original upload filename, so live display filenames are derived from the document title and verified MIME type. The download endpoint returns a validated HTTPS signed attachment URL; the browser downloads directly from storage without forwarding API credentials or a referrer.

Live ownership, private S3 visibility, content validation, signed URL expiry, rate limiting, and deletion lifecycle are governed by `../GentlePath-API/docs/FAMILY_RECORDS_API.md`. A download URL already issued by the backend remains usable until expiry or object removal. The web app does not claim permanent erasure when an account or child is soft deleted.

## Web Facade

All responses are `Cache-Control: no-store`.

| Method | `/portal/documents` Path | Request / Response                                                                                                                                 | Backend Mapping                                                    |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/`                      | `query`, `documentType`, `childId`, `personalOnly`, `limit` (1–100, default 9), `offset`; `{ data, page: { limit, offset, hasMore, nextOffset } }` | GET `/care-documents`; camelCase filters map to backend snake_case |
| POST   | `/`                      | Multipart `file`, `title`, `documentType`, optional `childId`; owned metadata, 201                                                                 | POST `/care-documents` with `document_type`, optional `child_id`   |
| GET    | `/{id}`                  | Owned metadata                                                                                                                                     | GET `/care-documents/{id}`                                         |
| PATCH  | `/{id}`                  | `{ title, documentType, childId }`; owned metadata                                                                                                 | PUT `/care-documents/{id}` with replacement semantics              |
| GET    | `/{id}/download`         | Live `{ url }`; demo `{ fileName, mimeType, sizeBytes, contentBase64 }`                                                                            | GET `/care-documents/{id}/download`                                |
| DELETE | `/{id}`                  | 204                                                                                                                                                | DELETE `/care-documents/{id}`                                      |

Metadata models use `id`, `userId`, `childId`, `title`, `documentType`, `fileName`, `mimeType`, `sizeBytes`, `createdAt`, and `updatedAt`. The browser cannot set owner, storage key, MIME type, byte size, or lifecycle metadata. Title is 1–300 characters. Categories match all thirteen existing backend document types. The file is immutable after creation; updating details changes title, category, and optional linked child. Tags are not part of the current backend contract.

Search is title search, case insensitive. Search, category, family-member filter, and page offset remain in the URL. Search uses the shared debounced, composition-safe directory filters and query cancellation. Deleting the final item on a page returns to the previous page. A direct out-of-range URL exposes the shared First Page action.

## File Handling And Recovery

The accepted formats and 10 MiB limit match the backend: PDF, JPEG, PNG, WebP. The client checks size, extension, MIME declaration, and file signature. The demo and live bridge independently repeat those checks. Multipart bodies are bounded to 10 MiB plus 32 KiB of envelope overhead before parsing; detail bodies are bounded to 8 KiB. The live backend additionally parses images, bounds decoded dimensions/pixels, and checks private storage metadata.

No uploaded PDF or image is rendered as active page content. Downloads start as attachments. Demo downloads validate the returned payload and create a short-lived Blob URL, which is revoked after the download starts. File contents and private drafts are never stored in local storage.

The current fetch-based API client does not expose byte upload progress, so upload status is indeterminate and explicitly says progress is unavailable. Cancelling aborts the browser request and preserves the file and all fields. A request that already reached the server may still complete; the list is refreshed on settled uploads and the cancellation copy asks users to check before retrying. The live backend does not guarantee idempotent upload retries. The demo honors an account-scoped UUID `Idempotency-Key` while a created document remains available.

Editing and upload errors retain user input and prevent duplicate submits. Shared navigation and unload guards protect drafts. Destructive deletion uses the shared confirmation and reports failures inline. Backend metadata writes retain the backend's last-write-wins semantics; the frontend does not claim atomic version conflict detection.

## Demo Lifecycle

`handleDocumentVaultRequest(request, path, session, context)` returns null for unrelated routes. It independently validates the active demo identity and scopes lists, reads, downloads, metadata updates, and deletion to that account. Linked children must remain owned and available. Other-account and missing IDs have the same unavailable response. Admin and superadmin identities have their own private vaults. Empty simulation returns an empty list; central demo dispatch owns delay/error simulation and maintenance gates.

`getDemoDocumentVaultState()` owns metadata and Base64 file content in this server process. Seed documents are valid, fictional PDFs generated from the single strings catalog. Uploads survive browser reloads in one process; server restarts, demo resets, and independent workers do not share/preserve them. This is local demonstration persistence, not cloud storage. `resetDocumentVaultDemoState()` clears both documents and upload deduplication state and must be called by the central demo reset lifecycle.

## Verification

Do not write tests. Verify with project static checks, demo web build, `git diff --check`, and focused browser/HTTP checks. Cover upload and private download, details save, search/category/child filters, pagination, deletion and cancellation, invalid/oversize files, failed mutations with retained input, empty/error/loading simulation, and cross-account metadata/byte denial. Live S3 validation requires the configured backend, database, and storage; demo verification does not prove those integrations.
