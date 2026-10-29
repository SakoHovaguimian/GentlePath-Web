# Milestone guidance, observations, and reviewed tips

The backend source of truth is [`GentlePath-API/docs/MILESTONES_API.md`](../../GentlePath-API/docs/MILESTONES_API.md), together with its milestone, milestone-observation, and tip services. These screens reuse the existing forest/ivory theme, Lora headings, shared controls, presentation dialogs, query boundaries, and unsaved-form guards. All authored display copy is in `gentlePathMilestoneAdminStrings` in `src/strings.ts`.

## Routes and ownership

- `/admin/milestones`: Admin and SuperAdmin manage guidance, tags, and ordered response options. The protected admin layout and authenticated proxy independently guard staff operations; the live backend is authoritative.
- `/milestones`: Families choose an owned child, browse the current guidance, record dated private observations, and open paginated observation history to correct or remove a record. Platform roles never grant access to another family's observations.
- `/tips`: Authenticated approved-tip library and `?view=mine` submission history. Families submit, edit, and remove their own tips. Approved tips expose only the public author projection.
- `/admin/tips`: Staff review queue with status, milestone, tag, query, and page filters. Review changes do not grant staff the author's edit/delete permissions.

Guidance, tips, and family guidance lists persist committed query, tag, milestone/status filters, offset, and page size in URL state. DirectoryFilters owns debounced, IME-aware search and clearing. Private observation history paging stays in its dialog state; note text and drafts never enter the URL or browser storage. Lists use backend `Page<T>` metadata and clamp after removal or an empty later page. Milestone choice selectors follow all backend pages so a milestone beyond the first 100 remains selectable.

## API facades

`MilestoneAdminService` follows the domain service → browser API client → authenticated Next.js proxy. The feature dispatcher maps these facade routes to the current backend without changing payload field names:

| Facade                                                     | Backend                                         |
| ---------------------------------------------------------- | ----------------------------------------------- |
| `GET /portal/milestone-tools[/{id}]`                       | `GET /milestones[/{id}]`                        |
| `POST /admin/milestone-tools`                              | `POST /milestones`                              |
| `PUT, DELETE /admin/milestone-tools/{id}`                  | `PUT, DELETE /milestones/{id}`                  |
| `PUT /admin/milestone-tools/{id}/response-options`         | `PUT /milestones/{id}/response-options`         |
| `PATCH /admin/milestone-tools/{id}/response-options/order` | `PATCH /milestones/{id}/response-options/order` |
| `GET, POST /portal/milestone-observations`                 | `GET, POST /milestone-observations`             |
| `GET, PUT, DELETE /portal/milestone-observations/{id}`     | `GET, PUT, DELETE /milestone-observations/{id}` |
| `GET, POST /portal/tips`                                   | `GET, POST /tips`                               |
| `GET /portal/tips/mine`                                    | `GET /tips/mine`                                |
| `GET /portal/tips/review-queue`                            | `GET /tips/review-queue`                        |
| `GET, PUT, DELETE /portal/tips/{id}`                       | `GET, PUT, DELETE /tips/{id}`                   |
| `PATCH /admin/tips/{id}/review`                            | `PATCH /tips/{id}/review`                       |

Queries retain backend filter names and paging semantics. Private observation and all tip responses use `Cache-Control: no-store` in demo; live response handling retains the backend's sensitive/no-store behavior. No browser authentication or backend credentials are introduced.

## Response identity and history

Response options have stable server IDs and immutable existing values. The editor preserves existing IDs and uses temporary client row IDs only for unsaved additions. ReorderableList supplies pointer handles, keyboard arrow movement, and explicit up/down buttons. Saving guidance sends the full active option list in order. Removing an existing option asks for confirmation and retires it only on the subsequent successful save.

The backend does not expose whether an active option is referenced. The UI explains that a referenced label is immutable and retains the draft if the server returns a conflict; it allows valid edits to unreferenced labels. Retired values cannot be reused and retired IDs cannot be restored. Guidance removal hides its registry entry and makes related tips/observations unavailable while retaining history.

New observations and changed selections use active options belonging to the exact milestone. An unchanged retired option remains available when correcting an observation's date or notes. The selected option, including its retired label, comes from the backend observation detail. Child and milestone identity remain immutable on edit. Observed time is a required past/current instant; the shared datetime-local input intentionally keeps OS popup geometry and serializes into an ISO instant. History swaps into the editor within one dialog layer, retaining the history page while avoiding overlapping modal focus traps.

## Tip review lifecycle

New tips start Pending. The server derives author identity. The milestone link stays fixed and author edits reset the tip to Pending and clear the previous reviewer, review time, and notes. Rejection requires a nonempty note; approval permits no note. Reviewer identity and time are server-derived. A repeated decision conflicts; staff can reverse a previous decision after confirmation. Approval cannot make a deleted author's submission publicly visible.

The API exposes the current review record, not a chronological audit endpoint. My Submissions shows each submission's status, submission/update times, and available current review details without claiming to retain older decisions erased by author edits. Public results omit review details. Staff can inspect retained submissions from deleted authors in their authorized queue.

## Demo behavior

`getDemoMilestoneAdminState()` owns guidance, retained response options, tip tombstones, dated observation records, hidden milestone IDs, and referenced option IDs. On first initialization it migrates the legacy fixed-response demo observations once, matching each legacy response value to a stable seeded option ID. Existing legacy arrays stay untouched for compatibility. An already running development process upgrades only a missing observation collection during hot reload, preserving its guidance/tip edits.

The current family UI uses the dynamic option/observation service, so staff-created choices are immediately usable. The old fixed-enum PortalService methods remain compatibility APIs and are no longer the family's observation UI. Guidance edits also update the legacy portal guidance projection. Referenced IDs survive observation removal, maintaining the backend's immutable-label rule. All ownership checks resolve active demo accounts and current owned children; staff roles do not bypass them.

The overview uses `getDemoMilestoneObservationDates(userId)` / `getDemoMilestoneObservationCount(userId)` from this authority, avoiding duplicate counts of migrated legacy records. Hidden milestones, removed children, deleted observations, and unavailable accounts are excluded. `resetDemoMilestoneAdminState()` clears the feature state when the application's explicit demo reset also resets its portal fixtures. No Firebase, backend, analytics, push, or socket integration is needed.

## Verification

Scoped ESLint and the repository's title-case/inline-string analyzers passed for this feature. Local demo HTTP workflows exercised guidance create/update/hide; referenced-label and value conflicts; retirement and retired-response corrections; immutable observation identity; foreign-family denial including staff; submission ownership; required rejection notes; review reversal/repeated-decision conflicts; edit-to-Pending review clearing; public review omission; and deletion. Temporary HTTP workflow records were removed.

Browser verification on the isolated local demo preview exercised the family guidance layout, authored response popup, keyboard choice selection, successful dated observation recording, retained history, history-to-edit navigation, and dirty draft Keep Editing/Discard behavior. It revealed a shared presentation-layer interaction issue; the parent implementation repaired the shared modal/guard, and Keep Editing was rechecked successfully with the exact draft retained and Cancel focus restored. Static checks and local demo behavior do not verify a running production backend, its database transactions, or clinical content. The root task owns the full build/check, responsive/theme audit, and integration verification record.
