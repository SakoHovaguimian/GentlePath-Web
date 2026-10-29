# GentlePath product and API

The supplied GentlePath HTML is a product field guide and the visual source for colors, fonts, illustrations, tone, and product concepts. Its schema inventory describes a data foundation, not an existing backend. Proposed additions and AI concepts remain future product directions; this web implementation does not claim those integrations exist.

## Routes and permissions

| Surface                  | Routes                                                                                        | Access                                               |
| ------------------------ | --------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Landing and public reads | `/`, `/blog`, `/blog/[slug]`                                                                  | Public; published articles only                      |
| Family workspace         | `/dashboard`, `/family`, `/journal`, `/milestones`, `/resources`, `/resources/[id]`, `/saved` | Signed-in account; personal records are owner-scoped |
| Account and appearance   | `/profile`, `/settings/appearance`                                                            | Signed-in account                                    |
| Administration           | `/admin`, `/admin/users`, `/admin/moderation`, `/admin/blog/*`                                | Admin or SuperAdmin                                  |
| System configuration     | `/admin/settings`, `/superadmin`                                                              | SuperAdmin                                           |
| Developer controls       | `/dev-settings`, `/dev-settings/components`                                                   | Signed-in development/demo runtime only              |

Users manage their own family profiles, journal entries, resource favorites, and milestone observations. Admins publish blogs, review public-content reports, and inspect nonprivate user-directory records. SuperAdmins also change account roles/access and platform settings. Role permissions never grant access to other families' journals, notes, or observations. A SuperAdmin cannot demote/disable themself or remove the final active SuperAdmin.

The server checks protected layouts and proxy operations independently. Public session props contain only user information and expiry. The live backend must enforce role and ownership rules itself; frontend restrictions do not replace backend authorization.

## Portal API

Authenticated browser paths prepend `/api/backend`. Domain JSON is camelCase and is validated with the independent schemas in `src/modules/portal/models`. The client container owns `PortalService` and `AdminService`; TanStack Query owns business records and mutation invalidation.

| Upstream path                    | Methods            | Contract                                                                                           |
| -------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| `/portal/overview`               | GET                | Owner counts: journals, saved resources, observations, child profiles, seven daily activity counts |
| `/portal/children`               | GET, POST          | Owner profiles; create `{name,dateOfBirth,supportNotes}`                                           |
| `/portal/children/:id`           | GET, PATCH, DELETE | Owner only; removing a child clears journal links and removes its observations                     |
| `/portal/journals`               | GET, POST          | Owner reflections; `{title,body,emotion,childId}`                                                  |
| `/portal/journals/:id`           | GET, PATCH, DELETE | Owner only; child links must belong to the same account                                            |
| `/portal/resources`              | GET                | Library resources with per-account `saved` state                                                   |
| `/portal/resources/:id/favorite` | POST               | Idempotent `{saved:boolean}`; returns updated resource                                             |
| `/portal/milestones?childId=...` | GET                | Milestone topics plus selected child's latest observation                                          |
| `/portal/milestones/:id`         | PATCH              | `{childId,response}`; response is `not_yet`, `emerging`, or `often`                                |
| `/admin/overview`                | GET                | User/active/content/report/resource counts, role breakdown, seven daily registrations              |
| `/admin/users`                   | GET                | Nonprivate directory records including role/access status                                          |
| `/admin/users/:id`               | PATCH              | SuperAdmin only: `{role?,disabled?}`                                                               |
| `/admin/reports`                 | GET                | Public-content reports and review state                                                            |
| `/admin/reports/:id`             | PATCH              | `{status:resolved                                                                                  | dismissed,resolutionNote}`; retain reviewer attribution |
| `/admin/settings`                | GET, PATCH         | SuperAdmin flags: community, registration, maintenance, resource-review requirement                |

Directory arrays are displayed with bounded UI pages; committed filters and offset are URL state. Journal search remains component state. Domain APIs do not currently provide a large-scale server-paging contract for these small demo datasets; adopt one before using large production directories. Blog lists have full server paging/filter contracts in [BLOG.md](BLOG.md).

Platform demo gates reject signup when registration is disabled, community writes when community is disabled, and member domain access during maintenance. Admin operations remain available to restore service. Resource-review policy is stored for future resource-authoring integration; the current library is read-only.

## Demo and live boundary

Fixtures, credentials, mutation state, ownership checks, and scenario simulation live on the server. Reloads preserve demo mutations; process restarts or the explicit reset restore fixtures. Roles and scenarios are exercised through the same domain services and proxy as live requests. See [DEMO_MODE.md](DEMO_MODE.md) for settings schema, controls, and recovery.

The frontend implements these contracts and the complete demo. Live auth, content persistence, production moderation, and backend aggregation require a configured backend implementing the contracts. File vault storage, community posting/polls, sponsors/advertising, proposed family-sharing permissions, and AI workflows from the field guide are not implemented by these screens.
