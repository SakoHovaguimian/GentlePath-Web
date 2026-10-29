# Structured Blog Publishing

Public `/blog` and `/blog/[slug]` render published articles without authentication. The server reader emits text/headings/links/images before hydration; optional account likes/saves do not block anonymous reading. Staff use `/admin/blog/*` for drafts, add/reorder blocks, private unsaved preview, saving, and publication. The dominant Preview action is available at both ends of the editor.

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

Independent block schemas in [blog models](../src/modules/blog/models/) validate the editor, service, and demo. Preserve IDs through edits/reorder. Current bounds include 100 unique blocks and 250,000 structured UTF-8 bytes; text/image/list limits live in those schemas. Missing image descriptions prevent save.

The builder supports plus palette, pointer drag, handle Arrow Up/Down, explicit move controls, removal confirmation, and current-form preview. Shared guards preserve dirty/busy writing; uploads block save/navigation until settled. Preview never mounts engagement controls or publishes anything.

## Rendering And Embeds

[BlogContentReader](../src/modules/blog/components/BlogContentReader.tsx) maps validated types to known components; authored HTML/scripts never execute. Plain text is escaped; legacy Markdown uses the shared safe renderer. URLs reject credentials, private network addresses, unsafe schemes, and malformed values. Public upstream responses are parsed and drafts rejected.

[BlogEmbeddedMedia](../src/modules/blog/components/BlogEmbeddedMedia.tsx) offers explicit-load YouTube/Vimeo/Spotify players. [The resolver](../src/modules/blog/content/resolveBlogEmbed.ts) accepts exact provider hosts/validated IDs and constructs canonical player URLs. No frame loads until requested; Close removes it. Original links remain available, and unsupported pages stay external-link cards. Frames have authored titles, restricted permissions, origin-only cross-site referrers, and bounded dimensions. No arbitrary iframe HTML is accepted.

URL formats follow official [YouTube](https://developers.google.com/youtube/player_parameters), [Vimeo](https://help.vimeo.com/hc/en-us/articles/30021987305873-How-do-I-embed-parameters-to-a-Vimeo-com-URL), and [Spotify](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed) contracts. Playback, availability, and provider telemetry are external integration behavior, not established by demo rendering.

## Markdown And Revision Safety

`body` remains compatible with existing Markdown records; missing content defaults to an empty array. Structured content takes precedence. Conversion is explicit: Convert To Blocks creates one Markdown section preserving the original body and remains unsaved until save.

A valid article needs at least one complete block or a valid legacy body. Metadata rules and payload bounds live in [blogArticle](../src/modules/blog/models/blogArticle.ts). Every save/publication/deletion sends the observed integer revision. Success increments it; stale writes return 409 without discarding the draft. Duplicate slugs return 400. Saving an already published article updates public content immediately. Publication changes and removal use shared confirmation; unpublishing/removal use destructive colors.

## API And Images

Staff `BlogService` follows the authenticated domain/proxy path. Public SSR uses its server-only published service without reading/refreshing a session.

| Endpoint                                   | Behavior                                                       |
| ------------------------------------------ | -------------------------------------------------------------- |
| `GET/POST /blog`                           | Staff paging/create draft                                      |
| `GET/PATCH/DELETE /blog/:id`               | Staff read/save/delete with revision                           |
| `POST /blog/:id/publish` or `/unpublish`   | Revision-checked publication                                   |
| `GET /public/blog` or `/public/blog/:slug` | Published-only list/detail; drafts/missing return 404          |
| `GET /public/blog/id/:id`                  | Resolve a published UUID to its canonical slug for app actions |
| `POST /blog/media/upload`                  | Web facade forwarding to `/media/upload-media`                 |

Lists accept query/category, staff status, limit/offset, and return `{data,total,limit,offset}`. Search includes block text. Filter/page pushes create browser history. Public Next routes are GET-only under `/api/public/blog`.

Image upload is multipart through the authenticated proxy, never browser-to-backend credentials. The adapter checks PNG/JPEG/GIF/WebP signature/MIME and 5 MB limit, then forces IMAGE/public visibility. The backend owns decoding/S3. Explain public visibility before upload; preserve writing on failure. Block/article deletion does not promise storage-object deletion; unreferenced upload retention is backend-owned.

## Persistence And Demo

The sibling API's [structured publishing contract](../../GentlePath-API/docs/STRUCTURED_BLOG_API.md) owns persistence. It retains `/blogs` and legacy item ordering while exposing canonical publishing. Ordered BlogContent rows store `meta_data` JSONB with a GIN index; parent publication/revision/slug fields require migration `20261029110000_structured_blog_content`. Deploy/check it against the intended database before live use; the web build does not migrate.

JSONB supports path/containment queries. Its metadata GIN index does not optimize arbitrary case-insensitive substring search. Current search uses legacy text plus selected JSON paths; measured workloads may justify a separate full-text index.

Demo article state enforces trusted staff roles, visibility, slugs, and revisions. Demo uploads store actual validated bytes (20 images/25 MB cap) and serve typed public image responses at `/api/public/blog-media/:id`; reset/restart clears them. [Verification](VERIFICATION.md) covers add/edit/reorder/preview/upload/publication/SSR and revision recovery, with no live storage/provider writes during routine checks.
