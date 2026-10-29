# Community

The signed-in community is a shared public-content space. It does not expose family profiles, private journals, care documents, or milestone observations. The feed uses the existing GentlePath card, illustration, typography, theme, and shared-control system.

## Routes And Behavior

| Route                | Behavior                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/community`         | Bounded feed, committed search, All Posts/My Posts, tag query, create/edit/delete own posts, likes, and reporting |
| `/community/[id]`    | Complete post, bounded comments, create/edit/delete own comments, comment likes and reports                       |
| `/community/reports` | Current account's report history, reason/status search, retained original content and review notes                |

Feed query, author scope, tag and offset are URL state. Report query/status and comment offset are URL state. Feed pages contain 9 posts, comment pages 10 comments, and report pages 9 reports. The API accepts limits from 1 to 100. Empty out-of-range pages return to the first page. Detail links retain a validated `/community` return path so filters survive the round trip.

Posts allow a title of 1–500 characters, body of 1–20,000 characters, up to 30 distinct tags of 1–100 characters each, and an optional permanent public HTTPS image URL. Comments accept 1–20,000 characters and reports accept a reason of 1–10,000 characters. Schemas validate in forms, the domain service and demo/server adapters. Public image links exclude credentials, query strings, fragments, whitespace, backslashes, and private vault paths. Shared image links open only after an explicit click; the app does not automatically load arbitrary remote media. User-authored titles, text, reasons and review notes render as escaped text, preserving newlines.

Only the original author can edit or remove a post/comment, including when the viewer has an administrator role. Staff review uses the existing moderation workflow. Deletion is soft: it removes the target from current visibility and preserves report evidence. Removing a post also hides its comments through parent visibility. An author can repeat a deletion or remove their own comment after its parent becomes unavailable. Likes send the desired boolean state; repeated additions/removals do not duplicate counts. Removing an existing like remains possible against a hidden target through the API.

Forms preserve input on errors, block duplicate submissions, focus validation failures, and use the shared dirty/busy navigation guard. Destructive actions use the shared confirmation dialog. Changes announce success only after the server confirms them; affected community records and moderation counts are invalidated through TanStack Query. Creation stays in the owning feed, editing stays on the current screen, and deleting the current post returns to its feed. No drafts are written to browser storage.

## Browser Facade And Live Backend Mapping

Screens use `CommunityService` from `ClientServiceContainer.communityService`; hooks own cache state. All requests travel through the authenticated `/api/backend` proxy. Ownership and author IDs are server-derived, and tokens remain server-only.

| Facade Path                               | Method           | Actual Backend                                                                          |
| ----------------------------------------- | ---------------- | --------------------------------------------------------------------------------------- |
| `/portal/community/status`                | GET              | Returns `enabled: true` in live mode; see policy boundary below                         |
| `/portal/community/posts`                 | GET/POST         | `/posts`; query/tag/paging map directly, `scope=mine` becomes trusted current `user_id` |
| `/portal/community/posts/:id`             | GET/PATCH/DELETE | `/posts/:id`; PATCH becomes PUT                                                         |
| `/portal/community/posts/:id/comments`    | GET/POST         | `/post-comments` with server-set `post_id`                                              |
| `/portal/community/comments/:id`          | PATCH/DELETE     | `/post-comments/:id`; PATCH becomes PUT                                                 |
| `/portal/community/posts/:id/reaction`    | POST `{liked}`   | PUT/DELETE `/post-likes/:id`                                                            |
| `/portal/community/comments/:id/reaction` | POST `{liked}`   | PUT/DELETE `/post-comment-likes/:id`                                                    |
| `/portal/community/reports`               | GET/POST         | `/reports`; creation maps `post`/`post_comment` to `POST`/`POST_COMMENT`                |

`handleLiveCommunityRequest(request, path, forward, currentUserId?)` in `src/modules/community/server/handleLiveCommunityRequest.ts` returns `null` for unrelated routes. The central proxy supplies the authenticated forward callback, including per-request refresh. Providing the current session user ID avoids a profile lookup for My Posts. The adapter validates upstream transport models, maps snake_case to camelCase, and keeps upstream errors/statuses. Every response is `no-store`.

Pages retain the actual backend shape `{data,page:{limit,offset,hasMore,nextOffset}}`. Canonical post/comment details contain counts and no viewer-specific like flag. The adapter independently reads the current user's filtered likes for each returned row; those bounded reads run in parallel. Mutations never trust a browser-owned user ID or a client-supplied aggregate.

The own-report backend route is already owner-scoped and can include any supported public content kind. History keeps those records instead of filtering a returned page and corrupting paging. Community report creation accepts only posts/comments. Snapshots retain the original target identity, type, author public names, title/body, parent and timestamps, with post tags and public image references when available; private account/profile fields never enter the projection. Report status maps to Open/In Review/Resolved/Dismissed. Review notes remain visible after source edits/removal.

The mapping follows the sibling backend's `docs/COMMUNITY_POSTS_API.md` and `docs/CONTENT_MODERATION_API.md`. The actual backend remains authoritative for visibility, lifecycle, permissions, reactions, transactions, report retention, and staff decisions. No backend source changes are required for these community routes.

The same adapter bridges staff operations: GET `/admin/reports` reads `/reports/review-queue?limit=100&offset=0`, and PATCH `/admin/reports/:id` calls `/reports/:id/review` with mapped status and `resolution_notes`. The existing staff screen consumes an array and applies bounded local pages, so its live bridge currently returns the newest 100 reports. Full historical queue navigation requires migrating that screen/service to the backend page contract. In Review is grouped under Open in that staff UI; own report history preserves the exact status. Staff resolution explicitly sends `hide_target=false` because the existing review form does not offer target hiding. Reporter labels use Community Member because the report response contains no reporter name; it never substitutes the target author's name or fetches private user-directory fields.

## Demo Ownership And Policy

`handleCommunityRequest(request, path, session, context)` in `src/modules/community/demo/handleCommunityRequest.ts` returns `null` for unrelated routes. Its separate server-only state seeds shared conversations from the normal demo accounts. Mutations survive reloads and reset with `resetDemoCommunityState()`. Simulation delay/error runs in the central dispatcher; the handler applies the Empty scenario to lists without creating a browser fixture path.

The demo verifies active authenticated users on each operation, scopes My Posts and report history to the account, excludes unavailable authors/parents from visibility and counts, and enforces ownership independently from UI controls. `communityEnabled=false` makes community reads available and rejects writes. Maintenance rejects member domain access while administration remains available. An open composer remains mounted if the community becomes read-only, preserving its draft.

New reports also enter `getDemoPortalState().reports`, so `/admin/moderation` can review them. Community retains the report owner and immutable snapshot separately; owner history reads the same status, review notes, reviewer attribution and time as administration. `hideDemoCommunityTarget(targetType, id)` is exported for moderation integrations that support hiding. Reports never grant an authoring override.

Live policy boundary: the current sibling backend has no platform community/maintenance configuration endpoint. The live adapter does not invent a persisted configuration or mirror a demo switch into production. Its status reports available and actual upstream permissions govern writes. A production platform switch needs a backend policy contract and enforcement before it can be claimed as live functionality.

## Verification

No tests are added. Scoped ESLint, centralized-copy, semantic-color, shared-control and Tailwind checks cover the module. Manual demo HTTP verification covers post/comment creation, edits, author-only mutation, desired-state reactions, report ownership, admin review, immutable snapshots and deletion. Browser and build verification run through the parent integration task. Live backend behavior is contract-aligned but requires a configured live authentication/backend environment for end-to-end verification.
