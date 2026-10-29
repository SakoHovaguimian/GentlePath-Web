# Backend integration contract

`PORTAL_API_URL` is the server-only API base URL, including any prefix (for example `http://localhost:3000/api`). Browser paths are relative to `/api/backend`. The proxy adds `Authorization: Bearer <Firebase ID token>` and `app-version: <APP_VERSION>`. Requests/responses are uncached. Only a fixed set of request/response headers is forwarded. Incoming browser bearer/cookie/host headers are never copied upstream.

Portal preserves its existing snake_case user/feature/dashboard transports and maps them to camelCase domain models in [domainMappers](../src/services/api/domainMappers.ts). Transport definitions live in independent files under [models](../src/services/api/models/). They are maintained source, not generated OpenAPI output.

| Method and path relative to API base                   | Contract                                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| GET `/users/profile`                                   | Authenticated application user, including application ID and Firebase `external_id`                 |
| POST `/users`                                          | Provision application user after Firebase signup; accepts first_name, last_name, email, external_id |
| GET `/users?query=&limit=25&offset=0`                  | Page of UserTransport                                                                               |
| GET `/users/:id`                                       | UserTransport                                                                                       |
| PUT `/users/:id`                                       | Current user profile mutation; backend derives owner from token                                     |
| GET `/feature-requests?query=&limit=25&offset=0`       | Page of the current user's FeatureRequestTransport                                                  |
| GET `/feature-requests/:id`                            | Current user's FeatureRequestTransport                                                              |
| POST `/feature-requests`                               | `{ message }`; owner derived from token                                                             |
| PATCH `/feature-requests/:id`                          | `{ message }`; enforce ownership                                                                    |
| DELETE `/feature-requests/:id`                         | Enforce ownership; 204 on success                                                                   |
| GET `/dashboard/overview`                              | DashboardOverviewTransport                                                                          |
| GET `/dashboard/models`                                | `{ models: DashboardModelSummaryTransport[] }`                                                      |
| GET `/dashboard/models/:key`                           | DashboardModelMetaTransport                                                                         |
| GET `/dashboard/records?model=&search=&limit=&offset=` | Page of records authorized for the current user                                                     |
| GET `/chat/messages`                                   | Up to the latest 100 ChatMessage objects, oldest first                                              |
| POST `/chat/messages`                                  | `{ message }`; returns server-authored ChatMessage                                                  |
| POST `/realtime/tickets`                               | `{ ticket, expires_at }`, single use, short expiry                                                  |
| POST `/devices/`                                       | `{ device_token, device_type: "Web" }`                                                              |
| DELETE `/devices/`                                     | `{ device_token }`; unregister only the current user's device                                       |

A page is `{ data, total, limit, offset }`. Domain schemas enforce the required fields after mapping. Error responses use `{ message }` and a meaningful HTTP status. No token, stack trace, or private upstream payload should appear in errors.

Socket/push event contracts are in [REALTIME.md](REALTIME.md). Existing template endpoints and GentlePath's concrete API do not all use the same names or page shape. Server-only feature adapters in `src/services/api/featureBackendProxy.ts` translate documented portal contracts to the sibling GentlePath API. Adapt domain services, adapters, and matching demo handlers together; do not silently call an endpoint that only resembles the contract.

`BrowserApiClient` and the server API client pass `FormData` through with its browser/runtime-generated multipart boundary; JSON requests retain JSON serialization. Adapters receive a server-only forwarding callback that adds credentials and performs a single refresh/retry on upstream HTTP 401. Browser ownership and bearer headers are never accepted. Backend `ADMIN` and `SUPER_ADMIN` roles map to `admin` and `superadmin`; unrelated legacy roles receive ordinary family access.

Forwarded requests combine the incoming cancellation signal with the existing 30-second upstream timeout. A successful `DELETE /portal/account-tools/account` clears the encrypted session cookie in both demo and live mode. Subsequent client cleanup removes local push registration state without another authenticated backend request. Operator allowlist denials use HTTP 403; they do not indicate an expired session.

## GentlePath domains

The family workspace, administrative operations, role matrix, and camelCase domain API shapes are documented in [GENTLEPATH.md](GENTLEPATH.md). The public/publishing blog API and revision contracts are in [BLOG.md](BLOG.md). Live profiles include a trusted `role` (`user`, `admin`, or `superadmin`); missing roles default to `user`. These contracts extend the template endpoints; implement role checks and owner checks on the backend as well as in the authenticated proxy. No admin role grants access to personal family records.
