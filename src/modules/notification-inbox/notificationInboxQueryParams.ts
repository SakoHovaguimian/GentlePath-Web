import type {
  NotificationInboxFilters,
  NotificationInboxQuery,
} from './models/notificationInboxQuery';

export function notificationInboxQueryParams(
  query: Partial<NotificationInboxQuery>,
) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return params;
}

export function notificationInboxFilters(
  query: NotificationInboxQuery,
): NotificationInboxFilters {
  return {
    ...(query.query ? { query: query.query } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.read === undefined ? {} : { read: query.read }),
  };
}
