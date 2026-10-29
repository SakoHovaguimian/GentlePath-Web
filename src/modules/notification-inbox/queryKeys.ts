import type {
  NotificationInboxFilters,
  NotificationInboxQuery,
} from './models/notificationInboxQuery';

export const notificationInboxQueryKeys = {
  all: ['notification-inbox'] as const,
  list: (query: NotificationInboxQuery) =>
    ['notification-inbox', 'list', query] as const,
  counts: (filters: Omit<NotificationInboxFilters, 'read'> = {}) =>
    ['notification-inbox', 'counts', filters] as const,
  preferences: ['notification-inbox', 'preferences'] as const,
  settings: ['notification-inbox', 'settings'] as const,
};
