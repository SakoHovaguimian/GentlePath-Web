# Structured Blog Publishing

Public `/blog` and `/blog/[slug]` render published articles without authentication. The server reader emits text/headings/links/images before hydration; optional account likes/saves do not block anonymous reading. Staff use `/admin/blog/*` for drafts, add/reorder blocks, private unsaved preview, saving, and publication. The dominant Preview action is available at both ends of the editor.

## Topics And Cover Illustrations

Article Details offers Add Topic and Add Cover Illustration. A new topic accepts 2–80 characters; custom covers use the existing public image upload pipeline or a validated permanent HTTPS image URL. Six bundled illustrations and the original topic keys remain compatible. New choices become reusable when the article is saved; they are derived from visible saved articles, so deleting the last article using a custom choice removes it from the chooser.

`GET /blog/_options` returns staff-visible saved topics and covers; `GET /public/blog/_options` returns published-only choices. Public topic filters never expose draft-only topics or titles. The editor retains its current choices when loading saved options fails and offers Retry Saved Choices. Uploads block saving/navigation and preserve the draft on failure.

The API schema supports category/cover values up to 80/2,000 characters. Follow its [persistence and rollout contract](../../GentlePath-API/docs/STRUCTURED_BLOG_API.md#persistence) before using custom topics/covers live; local demo operation does not require a database.

## Content Contract

`content: Content[]` is ordered by array position. Every block has a stable UUID, a discriminant, and typed metadata:

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

| Type                             | Required Metadata           | Optional Metadata                      |
| -------------------------------- | --------------------------- | -------------------------------------- |
| `header`                         | `text`                      | —                                      |
| `section`                        | `body`                      | `title`, `format` (`plain`/`markdown`) |
| `footer`                         | `text`                      | —                                      |
| `quote`                          | `text`                      | `attribution`                          |
| `bullet`                         | `items`                     | —                                      |
| `divider`                        | Empty object                | —                                      |
| `embed`                          | HTTPS `url`, `title`        | `caption`                              |
| `image`                          | `src`, descriptive `alt`    | `caption`                              |
| `gallery2`/`gallery3`/`gallery4` | Exactly 2/3/4 image objects | Gallery `caption`                      |
| `callout`                        | `title`, `text`             | —                                      |
| `link`                           | HTTPS `url`, `text`         | —                                      |

Independent block schemas in [blog models](../src/modules/blog/models/) validate new writes in the editor, service, and demo. Preserve IDs through edits/reorder. Current write bounds include 100 unique blocks and 250,000 structured UTF-8 bytes; text/image/list limits live in those schemas. Missing image descriptions prevent save. A complete canonical `content` array is required; body-only legacy writes and unknown input fields are rejected.

Saved articles use a separate bounded, nontransforming [stored-content parser](../src/modules/blog/models/storedBlogContent.ts). It preserves metadata values and unknown fields, including historical headings, closing notes, quotes, and bullet lists that exceed today's write limits. Stored metadata allows five nesting levels, 100 entries per object, 25,000 entries per array, 100-character keys, 50,000-character strings, and 250,000 UTF-8 bytes per block. Article reads retain historical titles of 1–500 characters and introductions of 1–20,000; writes still require 3–140 and 20–350 respectively.

The builder uses aligned miniature previews for every block type and supports plus palette, pointer drag, handle Arrow Up/Down, explicit move controls, removal confirmation, and current-form preview. Shared guards preserve dirty/busy writing; uploads block save/navigation until settled. Preview never mounts engagement controls or publishes anything.

## Rendering And Embeds

[BlogContentReader](../src/modules/blog/components/BlogContentReader.tsx) maps safe known metadata shapes to components without applying new-write text limits or trimming stored writing; authored HTML/scripts never execute. Plain text is escaped; Markdown sections use the shared safe renderer. URLs reject credentials, private network addresses, unsafe schemes, and malformed values. Unsupported metadata shapes or unsafe media references remain visible as escaped saved data instead of being discarded or executed. Unknown fields are shown as complete escaped block data alongside any readable content. Structural editor fields accept incomplete URLs; a separate reader gate checks every link/image reference before use, so new media blocks remain editable without rendering unsafe sources. Public upstream responses are parsed and drafts rejected.

[BlogEmbeddedMedia](../src/modules/blog/components/BlogEmbeddedMedia.tsx) offers explicit-load YouTube/Vimeo/Spotify players. [The resolver](../src/modules/blog/content/resolveBlogEmbed.ts) accepts exact provider hosts/validated IDs and constructs canonical player URLs. No frame loads until requested; Close removes it. Original links remain available, and unsupported pages stay external-link cards. Frames have authored titles, restricted permissions, origin-only cross-site referrers, and bounded dimensions. No arbitrary iframe HTML is accepted.

URL formats follow official [YouTube](https://developers.google.com/youtube/player_parameters), [Vimeo](https://help.vimeo.com/hc/en-us/articles/30021987305873-How-do-I-embed-parameters-to-a-Vimeo-com-URL), and [Spotify](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed) contracts. Playback, availability, and provider telemetry are external integration behavior, not established by demo rendering.

## Markdown And Revision Safety

Canonical Markdown is stored inside a `section` block with `format: "markdown"`; current writes never send a separate `body` field. During rollout, older deployed responses may still include `body`. The read parser retains that optional bounded string exactly, and the reader displays meaningful earlier writing alongside canonical blocks. Older responses with no content array retain an empty block view while their earlier body stays intact. The editor keeps it read-only until staff explicitly choose Convert To Blocks, which appends the complete string as a Markdown section and removes only the retired transport field from the draft. Current limits still apply; conversion never slices the writing or removes existing blocks. Demo Markdown fixtures use canonical sections.

The API uses canonical structured storage without a legacy payload archive. A web read never reconstructs, truncates, or normalizes stored report evidence.

A valid write needs at least one complete block. Metadata rules and payload bounds live in [blogArticle](../src/modules/blog/models/blogArticle.ts). The editor retains the original saved metadata in its draft. Older values receive repair guidance; known fields remain editable, and unknown fields cannot disappear during save. For unsupported fields/shapes, View Saved Block Data preserves the original values so staff can copy them into a replacement block and explicitly confirm removal of the original. Saving or publishing rejects invalid new content; unpublishing an unchanged older article remains available.

Every save/publication/deletion sends the observed integer revision. Success increments it; stale writes return 409 without discarding the draft. Duplicate slugs return 400. Saving an already published article updates public content immediately. Publication changes and removal use shared confirmation; unpublishing/removal use destructive colors.

## API And Images

Staff `BlogService` follows the authenticated domain/proxy path. Public SSR uses its server-only published service without reading/refreshing a session.

| Endpoint                                        | Behavior                                                       |
| ----------------------------------------------- | -------------------------------------------------------------- |
| `GET /blog/_options` or `/public/blog/_options` | Reusable choices from staff-visible or published articles      |
| `GET/POST /blog`                                | Staff paging/create draft                                      |
| `GET/PATCH/DELETE /blog/:id`                    | Staff read/save/delete with revision                           |
| `POST /blog/:id/publish` or `/unpublish`        | Revision-checked publication                                   |
| `GET /public/blog` or `/public/blog/:slug`      | Published-only list/detail by slug or UUID; drafts/missing return 404 |
| `GET /public/blog/id/:id`                       | Resolve a published UUID to its canonical slug for app actions |
| `POST /blog/media/upload`                       | Web facade forwarding to `/media/upload-media`                 |

Lists accept query/category, staff status, limit/offset, and return `{data,total,limit,offset}`. Search includes block text. Filter/page pushes create browser history. Public Next routes are GET-only under `/api/public/blog`.

Image upload is multipart through the authenticated proxy, never browser-to-backend credentials. The adapter checks PNG/JPEG/GIF/WebP signature/MIME and 5 MB limit, then forces IMAGE/public visibility. The backend owns decoding/S3. Explain public visibility before upload; preserve writing on failure. Block/article deletion does not promise storage-object deletion; unreferenced upload retention is backend-owned.

## Persistence And Demo

The sibling API's [structured publishing contract](../../GentlePath-API/docs/STRUCTURED_BLOG_API.md) owns persistence. It retains conventional `/blogs` CRUD and its canonical `{data,page:{limit,offset,hasMore,nextOffset}}` pages alongside the camelCase `/blog` and `/public/blog` publishing transport. The web publishing lists retain `{data,total,limit,offset}`. These transports share one persistence model and revision/publication rules.

Ordered BlogContent rows store `meta_data` JSONB with a GIN index and parent publication/revision/slug fields. The API's [persistence contract](../../GentlePath-API/docs/STRUCTURED_BLOG_API.md#persistence) describes the canonical prelaunch schema and pending forward migrations. The unused legacy archive is removed; the already-applied initial migration is preserved. Inspect the intended database's migration ledger through the normal API release process before applying forward migrations. The web build does not migrate.

JSONB supports path/containment queries. Its metadata GIN index does not optimize arbitrary case-insensitive substring search. Current search includes selected JSON paths; measured workloads may justify a separate full-text index.

Demo article state enforces trusted staff roles, visibility, slugs, and revisions. Demo uploads store actual validated bytes (20 images/25 MB cap) and serve typed public image responses at `/api/public/blog-media/:id`; reset/restart clears them. [Verification](VERIFICATION.md) covers add/edit/reorder/preview/upload/publication/SSR and revision recovery, with no live storage/provider writes during routine checks.
