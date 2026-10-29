# Product And Feature Map

GentlePath combines a private family workspace, shared community/editorial content, and staff operations. The table identifies the code owner; the sections below retain the rules that are easy to miss. Schemas and registered adapters are authoritative for exact fields and commands. Shared transport/auth rules live in [integrations](INTEGRATIONS.md), not separate per-feature copies.

## Routes And Owners

| Surface | Routes | Source Owner |
| --- | --- | --- |
| Public site and journal | `/`, `/blog`, `/blog/[slug]` | `modules/landing`, `modules/blog` |
| Family and reflections | `/dashboard`, `/family`, `/journal` | `modules/portal` |
| Private documents | `/documents` | `modules/documents` |
| Resources and guides | `/resources/*`, `/guides/*`, `/admin/resources/*`, `/admin/guides/*` | `modules/portal`, `modules/editorial` |
| Ratings, likes, saves | Reader actions, `/saved`, `/saved/[id]` | `modules/engagement` |
| Community Posts/Polls | `/community`, `/community/[id]`, `/community/reports`, `/polls`, `/polls/[id]` | `modules/community`, `modules/polls` |
| Milestones and tips | `/milestones`, `/tips`, `/admin/milestones`, `/admin/tips` | `modules/milestone-admin`, portal milestone components |
| Family discounts and commercial tools | `/discounts/*`, `/admin/commercial/*` | `modules/commercial` |
| Inbox and preferences | `/notifications`, `/settings/notifications` | `modules/notification-inbox` |
| Account and operations | `/profile`, `/settings/account`, `/settings/devices`, `/settings/delivery-history`, `/admin/ai-usage`, `/help` | `modules/users`, `modules/account-tools` |
| Platform administration | `/admin`, `/admin/users`, `/admin/moderation`, `/admin/settings`, `/superadmin` | `modules/portal` |
| Existing utility/specimen flows | `/feature-requests/*`, `/chat`, `/users/*`, `/experience`, `/dev-settings/*` | matching modules; developer routes are runtime-gated |

All paths above are under `src/`. Navigation is composed in [portalNavigation](../src/modules/portal/portalNavigation.tsx). Community has one sidebar entry and a shared Posts/Polls segmented switch; `/polls` remains the stable poll route and return destination.

## Permissions And Privacy

- Public users read landing/published articles. Account actions require authentication without blocking public article reading.
- Every signed-in role owns its own children, journals, documents, observations, preferences, devices, and saved pivots. Admin/SuperAdmin do not gain access to another family's private records.
- Staff author reviewed resources/guides/blogs, administer milestones/commercial content, and review public reports/tips. Author-only post/comment/poll/tip edits remain author-only for staff too.
- SuperAdmin additionally controls platform/account permissions. Delivery and AI ledgers also require the live backend's external-ID allowlist; role alone is insufficient. Self/final-active-SuperAdmin safeguards apply.
- No AI inference, clinical assessment, family-sharing, payments, billing, or data-erasure workflow is implied by the existing screens.

## Family Records And Documents

Private journal search/drafts stay out of URLs and browser storage. Child references must belong to the current account. Demo child removal deletes related observations and detaches journal links while retaining journal text. Check the actual backend family contract before changing lifecycle behavior.

Document facade `/portal/documents` maps to `/care-documents` in [the family API](../../GentlePath-API/docs/FAMILY_RECORDS_API.md). Models, service, and live adapter live in `modules/documents`; metadata editing changes title/type/owned child, not the uploaded file or owner.

Uploads accept PDF/JPEG/PNG/WebP up to 10 MiB, with server-side body/signature checks. Never render private uploads as active content. Live downloads use validated HTTPS signed attachment URLs without API credentials/referrer; issued URLs may remain valid until expiry. Demo serves validated stored bytes through its private facade. Upload progress is indeterminate; cancellation can race a completed server write, so refresh/check before retrying. Demo upload idempotency is not a live guarantee. Metadata uses last-write-wins semantics; deletion does not promise permanent object erasure.

## Resources And Guided Steps

`EditorialService` and its server adapters map `/portal/editorial/*` and `/admin/editorial/*` to `/resources` and `/guided-steps`. [Reviewed content API](../../GentlePath-API/docs/REVIEWED_CONTENT_API.md) owns canonical types, formats, provenance, collections, and replacement semantics.

Guides retain item IDs and derive order from the complete array; a dedicated reorder includes every active item exactly once. Current step is local reading state, not completion/assessment. Optional source attribution belongs in step metadata because guides have no parent provenance field.

Noncollection resources require source name/URL. Publication dates cannot be future dates; review attribution comes from staff identity/server time and does not mean clinical review. Collections may omit sources; reject self/descendant cycles and retain collection type while children exist. Removing a collection hides descendants through ancestry visibility. Preserve unrelated metadata during replacement. No revision-precondition contract exists for these writes.

The live adapter also bridges the existing family `/portal/resources` library and resource-save facade. Keep canonical type/format separate from family category/read-time metadata. Follow all required pages with nonadvancing/upper-bound protection, never silent truncation. Resource aggregates flow through the same list mapping, so gold rating summaries on cards/header require no per-card queries.

## Ratings, Likes, And Saved Content

`/portal/engagement/*` maps to resource-rating, blog-like, and typed favorite endpoints in the reviewed-content API. Resource ratings are one integer 1–5 per account; changes replace that rating. Shared StarRating owns accessible radio interaction; RatingSummary owns compact aggregates. These APIs rate resources, including guide-format resources, not Guided Steps.

Favorites support visible public content kinds, excluding private journals/documents. Validate the target before paging/creation, including ancestor/author visibility, published blogs, and approved tips. Removing an existing pivot remains idempotent after its target disappears. Resource saves share the same authoritative backend pivot/demo resource set with legacy controls and overview counts.

Saved previews use safe typed summaries (bounded text) and known internal reader paths. Published article slugs enable direct reading; older summaries without a slug use Saved Preview. Public article controls use the focused optional-account container; editor previews do not mount engagement controls.

## Community Posts And Polls

Post facade `/portal/community/*` maps to `/posts`, `/post-comments`, post/comment likes, and `/reports`. See [posts](../../GentlePath-API/docs/COMMUNITY_POSTS_API.md) and [moderation](../../GentlePath-API/docs/CONTENT_MODERATION_API.md). Lists, scope, tags, and pages are URL state; validated list return paths preserve filters. Only authors edit/delete; deleted parents hide their discussion. Reports retain original evidence and owner-scoped history/review details after source changes/removal.

Post detail preserves open forms during transient background errors and offers retry; 401/403/404 still remove inaccessible content. Shared ReactionButton owns red filled-heart state, confirmation-based animation, accessible counts/pressed state, and reduced motion. Comment actions use a chat bubble.

Current live viewer-like enrichment is bounded parallel per-row reads because the API has no batch viewer-state endpoint: feed 1 list + up to 9 like reads, detail 2 reads, comments 1 list + up to 10 like reads. An arbitrary page of all account likes is not a correct substitute. Staff moderation currently exposes only the newest 100 reports and cannot hide targets; [integration limits](INTEGRATIONS.md#api-proxy-and-mapping) explain the bridge.

Poll facade `/portal/polls/*` maps to the [poll API](../../GentlePath-API/docs/POLLS_API.md). Options have stable IDs; ballots select distinct active options from that poll. Single choice means exactly one, multiple means one or more. Ballot reads are private; results expose aggregate participants/selections. Multiple-choice percentages may exceed 100% in total.

Any retained ballot, including one from an inactive account, freezes question/message/mode/option labels and membership. Tags and reordering unchanged choices remain editable; preserve drafts on conflicts. The API has no close/reopen/expiry lifecycle. Poll cards preview the two most-voted choices (stable option-order tie break) and remaining-option count; unvoted polls show ordinary answer options. Poll discussion has author-only edits and shared heart reactions.

Content tag words are capitalized throughout web/API inputs, outputs, and filters; acronyms and existing mixed-case names are preserved. Duplicate case variants are rejected. Retained demo state upgrades without reset; existing database rows require the tag backfill migration.

## Milestones And Reviewed Tips

The family UI uses `MilestoneAdminService`, `/portal/milestone-tools`, `/portal/milestone-observations`, and `/portal/tips`; staff writes use their matching admin facades. [Milestone API](../../GentlePath-API/docs/MILESTONES_API.md) owns historical option and review rules.

Response IDs/values stay stable. Save the active options in full order; retiring an option preserves history, reserves its value, and does not restore it later. Referenced labels cannot change; the server can reject a change even when the UI cannot know references exist. Observation edits retain child/milestone identity and may keep an unchanged retired choice when correcting date/notes. New selections use active options belonging to that milestone. Dates are past/current instants; history stays private to the owned child.

New/edited tips become Pending; author edits clear prior review details. Rejection needs a note; reviewer/time are server-owned. Staff review never grants author-edit rights. The API exposes the current decision, not a chronological review audit. Hidden milestones/removed children/accounts are excluded from private overview counts. Dynamic demo state, rather than the old fixed-response array, is authoritative.

## Commercial And Family Discounts

Staff can create/manage offers directly from Family Discounts or `/admin/commercial/offers/new`. Select an eligible approved sponsor, save content, approve review, verify against a source with valid dates, then enable the offer. A new/editable record is not automatically eligible for family serving.

`CommercialService` maps reader `/portal/commercial/*` and staff `/admin/commercial/*` to sponsors, discount offers, campaigns, creatives, placements, and aggregate metrics. [Commercial API](../../GentlePath-API/docs/COMMERCIAL_API.md) defines the commands.

Content edits reset review and serving enablement; offer edits clear verification. Sponsors have review/suspension rather than an enable flag. Immutable attribution/relationship fields require new records to change. Offer verification must remain valid and within expiry; affiliate content needs its disclosure. Placement replacement preserves association identity/history, complete order, and retired metrics. The two reserved placement keys remain reserved after deletion.

Serving checks eligible parents/offers, dates, review, enablement, verification, locale/platform, and disclosure before limiting results. Carousels respect pause, hover/focus/background/reduced motion. Authored colors stay within creative artwork; disclosure/action regions retain the readable theme. Approved app destinations resolve known web routes; blog UUIDs resolve published slugs. Framed partner pages retain an external-link fallback.

Metrics are daily submitted aggregate impressions/clicks/code copies, not unique people. No private family/device/health data becomes targeting. Browsing and staff preview do not automatically ingest metrics or call Amplitude; explicit demo impression simulation only changes local state.

## Notifications

`NotificationInboxService` maps `/portal/notification-inbox/*` to `/notifications` and `/user-settings`. Only the account's published, in-app-enabled, non-archived/non-expired records are visible. Opening/following an update never implicitly marks read. All/Unread/Read, search, category, order, and page state remain explicit and shareable.

Counts ignore the selected read-status filter; the shell bell counts the entire account. Bulk actions state whether they affect all or filtered records across pages. Archive has no promised restore/Undo and uses destructive confirmation/styling. Only supported same-origin destinations become actions.

Category/channel preferences apply to future notifications and are separate from FCM/browser authorization. Effective scheduling timezone is explicit override → last detected browser zone → UTC. Nonblocking detection records only the last zone and cannot replace an override. Displayed dates still use browser timezone. Appearance remains the owner of browser push opt-in.

## Account And Operational Tools

`AccountToolsService` maps account/devices/Help to existing users/devices/system endpoints; operator delivery/attempt and AI ledger tools map to their dedicated APIs. Pass trusted current identity and role through the proxy. Never return device tokens, provider identifiers, delivery destinations, or leases to the browser.

Account deletion verifies typed current email plus acknowledgement. It soft-deletes access; it does not erase uploaded objects, database history, or Firebase identity. Clear the encrypted cookie, queries/session, sockets, and local push state on success without another authenticated request. Device removal deactivates that notification registration and does not revoke a sign-in session.

AI usage is an operational ledger, not AI generation; deletion is soft and Deleted Records permits inspection, not invented restoration. Delivery/AI tools require SuperAdmin and the backend allowlist. Production legal/FAQ text comes from the API; demo samples remain clearly illustrative and do not establish policy/retention commitments.

## Demo And Live Boundary

All modules use the same domain services and authenticated proxy in both modes. Demo validation, ownership, counts, visibility, and mutations are server-owned; reset must clear every module store. [Demo mode](DEMO_MODE.md) explains lifecycle and simulation. [Integrations](INTEGRATIONS.md) records retained live gaps; complete demo behavior and a successful build never prove configured live authorization, storage, delivery, serving, or persistence.
