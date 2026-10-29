# Ratings, Likes, And Saved Content

The engagement module owns resource ratings, article likes, and the current account's saved library. It follows screen → TanStack Query hook → `EngagementService` → `BrowserApiClient` → authenticated Next.js backend proxy. The browser never receives tokens or ownership identifiers in mutation inputs.

## Readers And Controls

- `/saved` lists saved resources, journal articles, guides, community posts/comments, polls/comments, approved tips, and milestones. Committed search, type, and paging use URL state. The backend filters targets before paging; the web preserves its page metadata.
- `/saved/[id]` displays the backend's safe saved summary, with a maximum 500-character preview. It supplies an original-reader action when a dedicated reader exists. This also provides a readable preview for content without a dedicated route and for older blog backends that omit a slug.
- Resource details show the current account's rating, aggregate average/count, and 1–5 choices. Selecting another value updates the same rating; Remove My Rating deletes it.
- Public article readers mount an isolated query provider and the public client-service factory. Optional account actions use the authenticated proxy, with automatic unauthorized navigation disabled. A visitor can continue reading and receives a sign-in action with a safe article return path. Editor previews do not mount engagement controls.
- `SavedContentButton` supplies the same save/remove behavior on other protected content readers. Resource saves in the existing portal continue to use the legacy resource facade; both facades resolve the same backend pivot and demo resource set.

All controls use the shared Button, Radio, DirectoryFilters/Select, pagination, cards, mutation errors, and presentation feedback. Copy stays in `gentlePathEngagementStrings` inside `src/strings.ts`. No palette, typography, or shared behavior owner changes are introduced.

## Authenticated Facade

| Web Facade                                               | Behavior / Actual API                                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `GET /portal/engagement/favorites`                       | Paged `GET /favorites`; translates `contentType` to `content_type`, preserving limit/offset and search |
| `GET /portal/engagement/favorites/{favoriteId}`          | Own `GET /favorites/{id}`; safe saved summary                                                          |
| `GET /portal/engagement/favorites/{type}/{id}`           | Own filtered `GET /favorites`; desired saved state                                                     |
| `PUT`, `DELETE /portal/engagement/favorites/{type}/{id}` | Body-free `PUT`, `DELETE /favorites/{content_type}/{content_id}`                                       |
| `GET /portal/engagement/resources/{id}`                  | Available resource aggregate plus own filtered resource-rating pivot                                   |
| `PUT`, `DELETE /portal/engagement/resources/{id}/rating` | `PUT`, `DELETE /resource-ratings/{resource_id}`; PUT validates `{rating: integer 1–5}`                 |
| `GET /portal/engagement/blogs/{id}`                      | Available legacy `/blogs/{id}` aggregate plus own like and favorite state                              |
| `PUT`, `DELETE /portal/engagement/blogs/{id}/like`       | Body-free `PUT`, `DELETE /blog-likes/{blog_id}`; returns the updated desired state and aggregate       |

The shared proxy owns session verification, token refresh, and upstream credentials. Every facade response is `no-store`. Live identifiers are UUID-validated. Content types are the backend's explicit public `ContentKind` values; private journals and care documents have no supported favorite type. Deleting one's own pivot remains idempotent when a target disappears. Rating and unlike removal recover from a subsequent target 404 without claiming the target remains available.

Reader paths are computed from typed identity and a validated article slug, never from backend-provided URLs. Favorite transport checks that target identity/type matches the pivot. Blog favorites use the optional safe `target.slug` projection added to the actual API content snapshot/favorite summary; legacy summaries without it fall back to Saved Preview. Resource, guide, post, poll, and comment paths stay within their known internal reader routes.

Unavailable targets are excluded by backend visibility, including deleted content/ancestors/authors, unapproved tips, and drafts. Demo applies corresponding target rules before paging. A target that becomes unavailable during navigation shows an unavailable state. The DELETE facade remains usable for previously known typed targets.

## Demo Ownership

`getDemoEngagementState` stores per-account favorite metadata, per-account ratings, and article-like sets in the server process. Resource saved membership remains authoritative in `getDemoPortalState().favorites` so existing resource cards, saved controls, and overview counts stay coherent. Stable favorite metadata is created lazily for existing resource saves.

Targets are resolved from the actual portal/editorial, blog, community, poll, and milestone/tip demo stores, including current visibility rules. Resource ancestry, comment parents, guide deletion, published articles, approved tips, and milestone availability are checked before a new save. Aggregates count nondeleted demo accounts, matching actual backend queries. Acting users must still have a valid active demo session. Empty scenario lists are empty; simulation/error behavior remains owned by the central demo boundary.

`resetDemoEngagementState` participates in central reset. `getDemoSavedCount` supplies the overview's generalized count and excludes unavailable targets. Generalized mutations invalidate engagement and portal queries; legacy resource saves invalidate the engagement family as well. A rating response updates its query and invalidates the portal resource list.

## Verification

No tests are added. Scoped ESLint covers the engagement module, saved routes, resource detail, and public article-reader integration. Whole-application checks/build and browser workflows are recorded with the parent feature integration in `docs/VERIFICATION.md`. Live transport behavior is implemented against the checked-in actual API schemas; production credentials, notifications, and analytics are not used for routine verification.
