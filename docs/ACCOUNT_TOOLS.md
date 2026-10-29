# Account And Operational Tools

`src/modules/account-tools/` owns independent schemas, the `AccountToolsService`, query hooks, five screens, and the demo/live facade handlers. All browser calls use the existing domain service → API client → authenticated backend proxy. Auth tokens, device tokens, delivery destinations, provider identifiers, and delivery leases are never included in the module's browser models.

## Routes And Permissions

| Browser Route                | Facade                                                                                      | Live API                                                                                | Access                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `/settings/account`          | `DELETE /portal/account-tools/account`                                                      | `GET /users/profile`, `DELETE /users/{currentId}`                                       | Current account only                                       |
| `/settings/devices`          | `GET /portal/account-tools/devices`, `DELETE /portal/account-tools/devices/{id}`            | `GET /devices`, owned `GET /devices/{id}`, `DELETE /devices` with server-resolved token | Current account only                                       |
| `/settings/delivery-history` | `GET /admin/account-tools/deliveries`, `GET /admin/account-tools/deliveries/{id}/attempts`  | `/notification-deliveries`, `/notification-deliveries/{id}/attempts`                    | Superadmin frontend role and backend external-ID allowlist |
| `/admin/ai-usage`            | `GET/POST /admin/account-tools/ai-usage`, `PATCH/DELETE /admin/account-tools/ai-usage/{id}` | `/ai-usage-events` list/create, `PUT/DELETE /ai-usage-events/{id}`                      | Superadmin frontend role and backend external-ID allowlist |
| `/help`                      | `GET /portal/account-tools/faq`, `GET /portal/account-tools/legal?context=...`              | `/system/faq`, `/system/legal-information` with `terms_of_service` or `privacy_policy` context | Signed-in account |

The delivery and AI usage server layouts add the superadmin role gate. The facade independently verifies the trusted role; the backend's configured external-ID allowlist remains authoritative in live mode. A role alone does not grant live operator access. Deploy the API's corrected `403` allowlist-denial response alongside this frontend so a permission denial is not mistaken for expired authentication.

## Lifecycle And Recovery

Account deletion requires the signed-in email typed exactly and an explicit acknowledgement in an app-owned dialog. The server compares that email with its trusted current account; it never accepts an owner ID from the browser. The API soft-deletes the account. This hides access to private records; it does not permanently erase records, uploaded objects, or the Firebase identity. Copy states these limits and offers no restore promise. On success, the proxy clears the encrypted cookie. The client cancels queries, clears its cache/session, stops realtime/listeners, removes browser push registration state without making another authenticated API request, and returns to sign-in with a completion message. Failures preserve the confirmation input and display inline recovery.

Device removal deactivates the owned registration and does not revoke another device's sign-in session. The facade first resolves the device through the owned API read and keeps its notification token server-only. Deletion confirmations state that distinction. AI event removal is also a soft delete; the Deleted Records filter permits inspection without an invented restore operation. AI edits preserve server lifecycle fields and replace the editable ledger fields; the backend currently supplies no revision precondition, so concurrent operator updates have the backend's existing last-write behavior.

Device search/type and offset, AI search/deleted/context/user filters and offset, delivery status/notification/date filters and offset, delivery attempt selection/offset, and Help section selection use URL parameters. Date filters use the browser timezone and include the selected start/end days. Paging is bounded to 20 records (10 attempts), and empty out-of-range pages return to the first page. API queries receive abort signals. Forms preserve input, show field-associated validation, block duplicate submits, and guard unsaved dismissal/navigation. Every read has loading, retry, and empty feedback.

Legal and FAQ production text comes only from the API. Demo responses set `illustrative: true` and show a persistent notice that the sample is not production terms, privacy policy, or a retention commitment. No production legal policy is authored in the frontend.

## Demo And Integration

`handleDemoAccountToolsRequest(request, path, session, context)` validates the current active demo identity on every request. Devices are owner scoped; operational ledgers require the current demo superadmin role. Deletion marks the account deleted and removes its demo credential/refresh sessions. Personal records remain hidden through the existing active-account boundary. State is process local and resets through `resetDemoAccountToolsState()` together with the application reset flow. Empty/loading/error scenarios remain owned by the existing demo dispatcher.

`handleLiveAccountToolsRequest(request, path, forward, userId?, role?)` maps the facade to the verified backend DTOs. The proxy owns origin checks, authentication, refresh, and cookie invalidation. Pass the trusted session user ID and role; missing role denies operator endpoints. Keep these handlers before the generic portal/admin dispatcher.

Demo verification does not establish live Firebase, provider, storage-retention, or external-ID allowlist behavior. No routine verification sends notifications, invokes AI, or writes to the live backend.

## Focused Verification

On October 29, 2026, scoped ESLint (the module, its routes, and the shared strings catalog), `node scripts/check-strings.mjs`, and `git diff --check` passed. Focused HTTP checks against the local demo on port 3002 verified all five page responses, bounded device pages without tokens, rejection of cross-account device removal, User/Admin operator denial, Superadmin delivery/attempt reads, AI event creation/editing/soft deletion/deleted inspection, illustrative legal/FAQ responses, and account deletion using a temporary signup account. A mismatched confirmation returned 400 without losing the session; successful deletion returned 204, and subsequent session reads and sign-in returned 401. Seed accounts were preserved.

The premium strict audit was run with this module and its routes as the source roots. Its unmodified report is `/tmp/gentlepath-account-tools-premium-audit.json`. The parser case-folds JSX component names and reports shared `Button asChild` links, shared `TextArea` controls, and the authored shared `Select` as native controls. These are false positives verified against the shared implementations: Link supplies navigation, TextArea owns `resize-none`, and Select uses React Aria. No screen-local equivalents were introduced to satisfy those detections. Full application checks, the demo build, browser interaction/theme/responsive verification, and live integration verification belong to the final integration pass.
