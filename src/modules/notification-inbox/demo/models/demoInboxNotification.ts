import type { NotificationInboxItem } from '../../models/notificationInboxItem';

export type DemoInboxNotification = NotificationInboxItem & {
  deleted: boolean;
  status: 'PUBLISHED' | 'SCHEDULED' | 'EXPIRED';
  inAppEnabled: boolean;
  expiresAt: string | null;
};
