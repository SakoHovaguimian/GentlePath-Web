# Polls

`/polls` lists visible community questions with search, All Polls/My Polls, selection mode, tag filtering, and server pagination. The committed search, filters, and offset live in the URL. `/polls/[id]` shows the question, the current account's ballot, aggregate results, and paginated discussion. `returnTo` accepts only the local `/polls` list and its query; discussion uses its own `commentOffset` parameter.

## Contracts And Ownership

The authoritative implementation is the sibling API's `docs/POLLS_API.md` and the `poll`, `pollComment`, and `pollCommentLike` modules. All active accounts can create polls, vote, comment, and like comments. Only the original author can edit or remove a poll or comment. Admin and Superadmin accounts receive the same author controls for their own content; their role does not grant an author override.

Polls require a title of 1–500 characters, a message of 1–20,000 characters, `SINGLE` or `MULTIPLE` mode, 2–100 ordered options of 1–500 characters, and at most 30 distinct tags of 1–100 characters. Retained option IDs are preserved when editing. New options omit backend IDs. Removed options retain historical records in demo and backend state.

Ballots require distinct active option IDs belonging to the poll. Single choice accepts exactly one; multiple choice accepts one or more. Saving replaces the current account's ballot atomically in the backend. Removing a vote clears that account's selections. Ballot reads are private and separate from public poll data. Results contain option selection counts and an active-account participant count. Multiple-choice percentages use participants as their denominator and may total more than 100%.

While any ballot exists, including a ballot from an inactive account, the backend freezes the title, message, mode, option labels, and active option membership. Tags and reordering unchanged active options remain editable. The UI disables those question fields when active participation is known and preserves drafts on a `409` conflict if another ballot or inactive ballot makes the backend restriction stricter. Authors should create a new poll to change a question after voting. Shared `ReorderableList` provides pointer handles, keyboard arrows, and explicit Up/Down actions.

The current API has no close, reopen, expiry, or deadline fields or endpoints. Voting remains available while a poll is visible and the account is active. The web UI does not introduce a separate closing lifecycle.

Comments support create, author-only edit/remove, and idempotent likes/unlikes. Public comments expose minimal author identity and active-account like counts. Own-like lookups remain server-side. Removing a poll hides its results and discussion while retaining registry history; no voter directory or other accounts' ballots are exposed.

## Transport

Browser components use `PollService` from the client service container. The path is domain service → `BrowserApiClient` → authenticated `/api/backend` route → module facade. No browser component reads credentials or calls the backend directly.

| Facade                                      | Backend                               |
| ------------------------------------------- | ------------------------------------- |
| `GET /portal/polls`                         | `GET /polls`                          |
| `POST /portal/polls`                        | `POST /polls`                         |
| `GET/PATCH/DELETE /portal/polls/{id}`       | `GET/PUT/DELETE /polls/{id}`          |
| `GET/PUT/DELETE /portal/polls/{id}/ballot`  | Same verbs on `/polls/{id}/ballot`    |
| `GET /portal/polls/{id}/comments`           | `GET /poll-comments?poll_id={id}`     |
| `POST /portal/polls/{id}/comments`          | `POST /poll-comments` with `poll_id`  |
| `PATCH/DELETE /portal/polls/comments/{id}`  | `PUT/DELETE /poll-comments/{id}`      |
| `POST /portal/polls/comments/{id}/reaction` | `PUT/DELETE /poll-comment-likes/{id}` |

`handleLivePollRequest` translates camelCase domain fields to the backend's snake_case contracts and maps minimal public author, option, ballot, and comment data. My Polls maps to the trusted session's `user_id`. List responses preserve the API's `{ data, page: { limit, offset, hasMore, nextOffset } }` contract. UI reordering is saved through the full replacement endpoint, which also supports unchanged-choice reordering after ballots exist.

`GET /portal/polls/status` exposes the demo community switch. Live returns enabled because the current API has no equivalent platform-setting route; live account and content authorization remains authoritative. Upstream failures are returned through the existing authenticated proxy, including token refresh and no-store behavior.

## Demo Runtime

`handlePollRequest` owns only `/portal/polls` and returns `null` for other namespaces. It authenticates the current active demo account, checks maintenance access, and applies the existing community-write switch to mutations. It never derives permissions from browser role fields. Accounts are rechecked before counting votes/likes or composing visible author and discussion data.

`getDemoPollState()` owns process-local polls, historical options, ballots, comments, and comment likes. `resetDemoPollState()` clears them and the next read reseeds fixtures. The shared demo dispatcher applies finite loading delays and error simulation; the poll handler supports empty directories without deleting data. No backend, Firebase, messaging, analytics, or Socket.IO integration is required.

Fixtures include a single-choice evening-routine poll authored by the User account with an Admin ballot and two discussion comments, an unvoted multiple-choice school-support poll authored by Admin, and an unvoted meet-up poll authored by Superadmin. Created and edited records survive browser reloads within one server process. Demo persistence does not verify live backend integration.

## Interaction And Verification

Shared query boundaries provide loading, retryable failure, empty, and no-results states. Forms retain input after failures and use catalog validation with first-invalid-field focus. Dirty/busy forms register with the shared navigation guard. Delete and vote-removal actions use shared confirmations and success toasts. Duplicate writes are disabled. Deleting the final item on a page returns to the preceding offset; discussion and poll-list paging remain independent.

Use local demo accounts for browser verification: create a poll, add/remove/reorder choices, edit it before voting, vote/update/remove a ballot, verify the recorded-vote edit restriction, update tags/reorder after voting, add/edit/remove a comment, like/unlike it, and confirm another account cannot edit or remove the content. Exercise search clearing, mode and owner filters, empty/error/loading scenarios, paused community writes, narrow layouts, and keyboard reordering. Run project static checks and the demo web build after integration. Do not write tests or run Xcode builds.
