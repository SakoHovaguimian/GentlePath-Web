# Notifications

`/notifications` is the signed-in user's notification inbox for User, Admin, and Superadmin accounts. `/settings/notifications` edits the same account's category/channel preferences and scheduling timezone. Platform delivery diagnostics remain separately restricted to Superadmin in Account Tools.

## Ownership And Data Flow

The feature lives in `src/modules/notification-inbox`. `NotificationInboxService` uses the shared API client and authenticated `/api/backend/portal/notification-inbox` proxy. `handleLiveNotificationInboxRequest` validates the browser contract, maps camelCase models to the existing backend transport, and verifies returned item/settings ownership. Shared route safety supplies session validation, credential refresh, same-origin mutation checks, and safe errors. No notification screen calls Firebase or the backend directly.

| Browser Feature Route                                   | Existing Backend Route                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| `GET /portal/notification-inbox`                        | `GET /notifications`                                               |
| `GET /portal/notification-inbox/counts`                 | `GET /notifications/counts`                                        |
| `GET/PUT /portal/notification-inbox/preferences`        | `GET/PUT /notifications/preferences`                               |
| `PUT /portal/notification-inbox/read`                   | `PUT /notifications/read`                                          |
| `GET/DELETE /portal/notification-inbox/{id}`            | `GET/DELETE /notifications/{id}`                                   |
| `PUT /portal/notification-inbox/{id}/read`              | `PUT /notifications/{id}/read`                                     |
| `DELETE /portal/notification-inbox`                     | `DELETE /notifications?scope=ALL` or `scope=FILTERED` plus filters |
| `GET /portal/notification-inbox/settings`               | `GET /user-settings`                                               |
| `PUT /portal/notification-inbox/settings/timezone`      | `PUT /user-settings/timezone`                                      |
| `PUT /portal/notification-inbox/settings/last-timezone` | `PUT /user-settings/last-timezone`                                 |

The authoritative contracts are the backend's `src/modules/notification/routes/notificationRoutes.ts`, notification models/repository, and `src/modules/userSettings/routes/userSettingsRoutes.ts` and models. Notification creation, delivery retries, and administrative delivery history are outside this inbox feature.

## Inbox Behavior

Only the current account's published, in-app-enabled, non-archived, non-expired notifications are visible. Search covers titles/messages and is limited to 200 characters. Category, read status, sort order, and offset are retained in the URL. The UI requests 20 records at a time; service paging accepts 1–100 records and caps offset at 1,000,000. Empty pages after a mutation or stale URL recover to the first page.

Counts cover the whole matching search/category, independently of the selected read-status filter. The shell bell always uses the whole account's unread count, keeps its control geometry stable, labels the count for assistive technology, and reports loading/unavailable states honestly. Counts refresh every 60 seconds in an active browser and the shared realtime provider invalidates `notificationInboxQueryKeys.all` when a notification event arrives.

Opening the inbox or following an update does not silently mark it read. Read/unread changes require the explicit action. Bulk read/unread supports backend `ALL`, `SELECTED`, and `FILTERED` contracts; the screen exposes whole-inbox or matching-filter actions and states that they span all pages. Archiving supports individual records and backend `ALL`/`FILTERED` scopes. Each archive confirmation names the scope and explains that restoration is unavailable; the UI does not promise Undo.

Destinations are restricted to supported same-origin product/public content paths. External URLs, protocol-relative URLs, auth paths, executable schemes, and unknown route roots are not rendered as actions. User-provided notification content is rendered as text.

## Preferences And Timezone

The preference editor supports the backend categories `ACTIVITY`, `MENTION`, `TAG`, and `PRODUCT_UPDATE` and channels `IN_APP`, `PUSH`, and `EMAIL`. Saves send only the changed category/channel pairs, retain failed drafts, block duplicate submits, and guard navigation away from unsaved edits. Server defaults are authoritative. A category preference is separate from browser push authorization and applies to future notifications.

The timezone editor stores a deliberate override using `{ timezone: string | null }`. Clearing it uses the backend's effective-zone order: explicit override, last detected browser timezone, then UTC. Named zones are validated with `Intl.DateTimeFormat`; numeric offsets and invalid names are rejected. Displayed notification dates still use the browser timezone and en-US formatting.

`NotificationTimezoneSync` uses the existing browser timezone hook. Once per user/detected zone during its mounted session, it compares persisted settings and nonblockingly records only `{ last_timezone }` when detection changed. This route cannot replace the explicit override. Repeated identical detections do not change the backend timestamp. Detection failures do not interrupt navigation or loop on render. Settings refetch failures retain mounted draft editors and expose retry feedback.

The existing Appearance screen and `WebNotificationService` continue to own the explicit browser Enable action, FCM opt-in, permission prompts, and cleanup. Neither the inbox nor timezone synchronization requests browser notification permission.

## Demo Runtime

`handleNotificationInboxRequest` uses process-local state in `notificationInboxState.ts`. Fixture copy is in the single `src/strings.ts` catalog. Each existing demo identity has its own published, read/unread, archived, scheduled, and expired examples. The visibility rules match the live repository, and personal mutations never cross accounts. Preferences and timezone settings are scoped to the trusted current session. New accounts have an empty inbox and the backend-equivalent default preferences.

The shared demo dispatcher supplies finite loading/delay/error simulation. Empty simulation returns an empty inbox and zero counts without deleting records; effective preferences and settings remain available. The developer reset calls `resetDemoNotificationInboxState`. Demo operations require no backend, Firebase, Socket.IO, Messaging, or Amplitude.

## Verification

Feature-scoped ESLint, the shared display-string checker, `git diff --check`, and the premium UI strict audit scoped to this module/routes were run. The scoped audit had zero findings; it supplements the parent task's full repository checks/build. Focused demo HTTP verification covers all three roles, paging/filtering/counts, single and bulk read states, foreign-owner rejection, individual/filtered/all archive, preference updates, timezone override/detection/clear/validation, cross-origin rejection, and response scenarios. This establishes demo behavior; live delivery and integration still require the configured backend and Firebase environment.

No tests or Xcode builds were added or run. Parent-task browser verification owns the shared preview and responsive/keyboard/theme workflow checks.
