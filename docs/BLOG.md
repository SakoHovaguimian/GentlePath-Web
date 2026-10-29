# GentlePath Journal

The public journal is available at `/blog` and `/blog/[slug]` without a session. Only published articles appear in public results or detail reads. Server rendering uses the server-only public service and produces the article text, headings, links, and images before hydration. Dates subsequently use the reader’s browser timezone. Covers retain the bundled GentlePath artwork.

Administrators and super administrators manage articles at `/admin/blog`, `/admin/blog/new`, and `/admin/blog/[id]`. A new article starts as a draft. The editor offers an Add A Block palette, direct field editing, removal confirmation, drag handles, keyboard Arrow Up/Down on a handle, and separate move buttons. Preview renders the current unsaved form privately. Saving a published article changes its public content immediately; publication changes and deletion use the shared confirmation dialog. Unsaved writing uses the shared navigation guard. Uploading disables save and navigation until the upload finishes.

## Structured Content

Each article now has `content: Content[]`. Every ordered block has exactly the public envelope below. IDs are stable UUIDs; array order is reading order. The same discriminated Zod schemas validate the editor, service responses, and demo mutations. Independent block/image/type models live in `src/modules/blog/models/`.

```json
{
  "id": "b2000000-0000-4000-8000-000000000001",
  "contentType": "section",
  "metaData": {
    "title": "A Small Beginning",
    "body": "A little room to find your own rhythm.",
    "format": "plain"
  }
}
```

| `contentType` | Required Metadata | Optional Metadata |
| --- | --- | --- |
| `header` | `text` | — |
| `section` | `body` | `title`, `format` (`plain` or `markdown`) |
| `footer` | `text` | — |
| `quote` | `text` | `attribution` |
| `bullet` | `items` (1–30 nonempty strings) | — |
| `divider` | Empty object | — |
| `embed` | HTTPS `url`, `title` | `caption` |
| `image` | `src`, descriptive `alt` | `caption` |
| `gallery2`, `gallery3`, `gallery4` | `images` containing exactly 2, 3, or 4 image objects | Gallery `caption` |
| `callout` | `title`, `text` | — |
| `link` | HTTPS `url`, `text` | — |

Headings are bounded to 200 characters. Plain text sections allow 20,000 characters; converted Markdown sections retain up to 50,000 characters. Closing notes, quotes, and callouts allow 4,000 characters; each list item allows 1,000; image descriptions allow 500; captions allow 1,000. Articles allow at most 100 unique blocks and 250,000 UTF-8 bytes of structured content. Missing image descriptions prevent save. All authored UI and fixture copy remains in the single `src/strings.ts` catalog.

The reader never executes authored HTML, scripts, or automatic third-party iframes. Embed blocks show an explicit external link with the source host; following it is a reader action. Links accept public HTTPS URLs without credentials, whitespace, control characters, or private network hosts. Images use HTTPS references or the narrowly validated local demo upload route. React escapes plain text; converted Markdown uses the existing safe `MarkdownContent` renderer. Public services parse upstream responses and reject any draft returned by an upstream public endpoint.

## Legacy Markdown And Revisions

The `body` field remains supported for existing Markdown articles and callers. Missing `content` defaults to an empty array; a valid legacy body still renders and saves. New articles use structured blocks. Existing Markdown remains editable until the author explicitly chooses Convert To Blocks, which creates a single Markdown text section and retains the full original formatting. Conversion stays in the unsaved form until save. Structured content takes precedence when both fields are present.

Article metadata validation is unchanged: title 3–140 characters, slug 3–100 lowercase letters/numbers/single hyphens, introduction 20–350, and author 2–100. At least one complete block or a legacy body of 40–50,000 characters is required. Category and cover remain enums. Mutation failures retain form values. Mutations carry the last observed integer `revision`; successful saves/publication changes increment it. Stale writes return HTTP 409, preserving the writer’s draft. A duplicate slug returns HTTP 400. Deletion uses the revision and is explained as irreversible in the editor.

## API And Upload Contract

Browser management follows screen → query hook/domain service → `BrowserApiClient` → authenticated `/api/backend/*` proxy. Both the proxy and live backend require an administrator or super administrator for management. Public SSR uses `publicBlogService` and never inspects or refreshes a session.

| Upstream Path | Method | Result |
| --- | --- | --- |
| `/blog` | GET | Administrative page including drafts |
| `/blog` | POST | Create a draft from article input; HTTP 201 |
| `/blog/:id` | GET | Administrative article detail |
| `/blog/:id` | PATCH | Save article input with `revision` |
| `/blog/:id` | DELETE | Soft-delete the live content registry with `{ revision }`; HTTP 204 |
| `/blog/:id/publish` | POST | Publish with `{ revision }` |
| `/blog/:id/unpublish` | POST | Return to draft with `{ revision }` |
| `/public/blog` | GET | Published articles only |
| `/public/blog/:slug` | GET | Published detail; draft/missing articles return HTTP 404 |
| `/blog/media/upload` | POST | Browser-domain upload facade; live forwarding uses `/media/upload-media` |

List query fields are `query`, optional `category`, optional administrative `status`, `limit` (1–50), and zero-based `offset`. Responses are `{ data, total, limit, offset }` using camelCase article fields. Search includes article metadata and authored block text. Paging clamps after filtering/deletion. Committed filter/paging changes add browser history so Back/Forward restores the previous list. Public APIs ignore administrative status filters. Public Next.js reads use `/api/public/blog/[[...path]]` (GET only).

`BlogService.uploadImage` sends multipart FormData through the same authenticated API client and proxy; it never contacts storage directly. The blog server adapter verifies PNG/JPEG/GIF/WebP MIME, a raster signature, and a 5 MB file limit, then forces `mediaType=IMAGE` and `visibility=public` before the backend media upload. Responses use the existing `{ fileName, thumbnailFileName, visibility, url, thumbnailUrl }` media shape. The backend’s media service verifies image decoding and owns S3 credentials. File errors appear inline and preserve writing. The UI explains before upload that article images are public and must be appropriate to share. Uploaded URLs stay in block metadata after save. Unreferenced live uploads follow the storage service’s retention policy; deleting a block/article does not claim to delete storage objects.

## Actual Backend Storage

The sibling `GentlePath-API` implements `/blog` and `/public/blog` in its existing blog module while retaining authenticated `/blogs` and its legacy `items`/ordering contract. Its independent canonical `Content` schema exposes `{ id, contentType, metaData }`; `Blog.content` uses the existing ordered `BlogContent` relationship. Canonical content and legacy item projections share row identifiers. Existing legacy writes increment the same parent revision. Drafts are also excluded from ordinary-account content visibility, favorites, and report targets. The backend’s focused [structured blog contract](../../GentlePath-API/docs/STRUCTURED_BLOG_API.md) documents the live routes and persistence details.

The authored migration `20261029110000_structured_blog_content` adds `BlogContent.meta_data` as JSONB with a GIN index, extends the block enum, and adds slug/publication/revision/editorial columns to `Blog`. It retains old columns/rows and backfills previously available articles as published with unique permanent slugs. This migration has not been applied by this frontend task. Apply it through the backend’s normal migration deployment against the intended database before using these live endpoints.

JSONB permits typed path queries and containment without serializing the whole article as an opaque Markdown string. The GIN metadata index supports containment; it does not make arbitrary case-insensitive substring search fast. Current text search uses the legacy text projection plus selected JSON text paths. A measured production search workload may justify a generated full-text search vector and GIN text index. No such full-text migration is claimed here.

## Demo Ownership And Verification

`handleDemoBlogRequest(request, path, actor)` enforces server-derived administrator roles, payload validation, published-only reads, unique slugs, and revision conflicts. `getDemoBlogState()` owns the process article array. The first fixture demonstrates structured text, headings, quote, list, callout, divider, and closing note; the other fixtures retain legacy Markdown coverage.

Demo uploads store actual validated image bytes in a server-process map and return `/api/public/blog-media/:id`. The public route serves only those typed image bytes in demo mode with no-store/nosniff headers. Storage is bounded to 20 images and 25 MB. Reset clears articles and uploaded images; process restart does the same. Uploaded images do not use S3, Firebase, a backend, analytics, notifications, or external writes. Empty/loading/error simulation still applies through the existing demo API wrapper.

Do not write tests. Verify with the repository static checks/demo build, then manually exercise add/edit/reorder/remove/preview, required-image-description errors, an actual local image upload, draft/publication lifecycle, public server-rendered content, legacy edit/conversion, stale revision rejection, filtering/history, keyboard, and narrow layout. Live database migration, Firebase authorization, and S3 upload verification require their configured services and are separate from demo checks.
