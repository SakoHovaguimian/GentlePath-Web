# Commercial Features

Commercial functionality follows the backend [commercial API contract](../../GentlePath-API/docs/COMMERCIAL_API.md). It does not add payments, checkout, subscriptions, billing, or a new commercial policy.

## Routes And Ownership

- `/discounts` is the authenticated family offer directory, with category/search filters and 12-record server pages. `/discounts/[id]` shows the terms, advertising and affiliate disclosures, code, sponsor, and verification provenance for one currently eligible offer.
- `HOME_CAROUSEL` appears on the family dashboard, and `FAMILY_DISCOUNTS_CAROUSEL` appears on the unfiltered first offer page. They resolve current serving eligibility rather than reusing staff records.
- `/admin/commercial` provides bounded directories for sponsors, offers, campaigns, creatives, placements, aggregate metrics, and a serving preview. Search/status/paging and committed metric filters live in URL state. Related-record pickers search and page through staff records.
- `/admin/commercial/[entity]/new` creates a record. `/admin/commercial/[entity]/[id]` owns details, content editing, review, verification, enablement, deletion, and placement item configuration. Creation opens its detail so the separate review/verification steps remain available. Saving an edit returns to the detail view. Deletion returns to the owning first directory page.
- The authenticated admin layout and proxy deny non-staff access independently. Backend permission checks remain authoritative. Reader responses exclude contact email, reviewer/verifier identities, and review notes.

The browser pipeline is screen → query/mutation hook → `CommercialService` → `BrowserApiClient` → authenticated backend proxy. The feature facade uses `/portal/commercial/*` for reader/serving/aggregate ingestion and `/admin/commercial/*` for staff. `handleLiveCommercialRequest` maps only supported commands to `/sponsors`, `/discount-offers`, `/ad-campaigns`, `/ad-creatives`, `/ad-placements`, and `/ad-metrics`. Reader offers use the public offer model; staff offer reads use `/discount-offers/admin`.

## Authoring And Lifecycle

Sponsor content edits return the sponsor to pending review. Sponsors have review/suspension state and no enablement flag. Campaigns, offers, and creatives have separate content, review, and enablement commands. Editing resets review and disables serving; offer edits also clear verification. Immutable sponsor/campaign/key fields are excluded from edits. A new attribution chain requires new records.

Offer verification requires a source URL, current timestamp, and future validity no later than offer expiry. Affiliate content requires its explicit affiliate disclosure. Creative authoring includes image/alternative text, layout/fit, every optional color, locale/platform choices, action destination, and linked offer. The server validates sponsor/relationship consistency, safe URLs and routes, and currently eligible code-copy offers. Date controls use the shared native schedule-field ownership documented in the UX contract.

Placement configuration uses at most 50 unique creatives, optional item windows, enablement, and shared pointer/keyboard reorder controls. Saving sends one item replacement whose array order defines positions; the service also exposes the API's full-order command. Retired associations retain their identity and metrics and are reused when the same creative is reattached. The two placement keys remain reserved after soft deletion, as required by the API. A duplicate-key create is a conflict rather than a replacement operation.

Serving checks all parents and linked offers, windows, approval/enablement, verification, locale, platform, and disclosures before applying the 1–10 item limit. The web carousel honors auto-advance and pagination settings, provides previous/next and pause controls, preserves a stable slide frame, and suppresses rotation during hover, keyboard focus, background tabs, and reduced motion. Staff preview and ordinary reads do not ingest metrics. Required sponsor/disclosure/code/action regions use the normal semantic theme; optional authored creative colors affect the presentation region only.

`OPEN_APP_ROUTE` actions use the shared guarded `NavigationLink`. Native routes map to the existing web destinations: family discounts → `/discounts`, guided steps → `/guides`, posts → `/community`, and blogs → `/blog`. A blog UUID is resolved through the published-only `/public/blog/id/{UUID}` endpoint to its canonical slug; draft/unavailable IDs fail safely. Milestone UUIDs open `/tips?milestone_id={UUID}`; the milestone collection opens `/milestones`. Deep links retain the API-approved GentlePath destination. In-app browser actions open a sandboxed modal browser with a normal partner-link fallback for sites that prohibit framing.

## Metrics And Privacy

Staff metrics are daily submitted aggregate impressions, clicks, and code-copy counts, not unique-person measurements. The directory supports commercial IDs and UTC date filters. No user, child, device, session, or health identifiers are added. Family profiles, journals, observations, and private documents never become commercial targeting inputs.

The ingest service accepts only the actual strict aggregate payload, resolves a selected eligible item, and never adds analytics identity or calls Amplitude. This feature does not automatically report impressions, clicks, or code copies from ordinary browsing or previewing. In demo mode, the explicit **Add Demo Impression** preview action exercises local aggregate mutation only.

## Demo State And Verification

`demoCommercialState.ts` keeps process-local state on `globalThis`, shared across route bundles and preserved through ordinary hot reloads. Reset restores approved demo sponsor/offer/campaign/creative, both placements, and illustrative daily aggregates. It never calls a backend, Firebase, Messaging, Socket.IO, or Amplitude. The demo handler uses the trusted current account for staff permissions and review attribution, mirrors strict commands/immutable fields, preserves soft-deleted aggregate history, and supports Empty responses without deleting saved state. Request-level delay/error simulation remains owned by the central demo API.

Focused local demo HTTP verification covered all staff directories, sponsor/offer/campaign/creative creation and approval, offer verification/enablement, code-copy serving derivation, placement replacement/reorder/retirement/re-attachment, unknown metric-field rejection, suspension removing serving, edit resets, immutable-field rejection, soft-delete aggregate retention, and member denial of every staff directory. The seeded two-key capacity means duplicate placement creation is an expected conflict. Scoped ESLint and centralized strings checks passed during implementation. Full application checks/build and browser QA are recorded centrally in `docs/VERIFICATION.md`.

The supplementary scoped premium audit flags capitalized shared `Select`/`TextArea` and `Button asChild` usage as literal-native/actionless patterns. These are static regex false positives; the feature imports the canonical authored components and links. That audit does not establish browser, accessibility, or live integration behavior. Local demo workflows do not verify a deployed commercial API or partner website behavior.
