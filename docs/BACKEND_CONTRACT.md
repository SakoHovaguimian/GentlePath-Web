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

Socket/push event contracts are in [REALTIME.md](REALTIME.md). This is a template integration boundary; the exact JobLens construction-project and Obelisk business endpoints differ. Adapt the domain services and matching demo handlers together when targeting those APIs. Do not silently call an endpoint that only resembles the contract.

## GentlePath domains

The family workspace, administrative operations, role matrix, and camelCase domain API shapes are documented in [GENTLEPATH.md](GENTLEPATH.md). The public/publishing blog API and revision contracts are in [BLOG.md](BLOG.md). Live profiles include a trusted `role` (`user`, `admin`, or `superadmin`); missing roles default to `user`. These contracts extend the template endpoints; implement role checks and owner checks on the backend as well as in the authenticated proxy. No admin role grants access to personal family records.
