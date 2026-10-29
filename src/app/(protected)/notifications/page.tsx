import type { Metadata } from 'next';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import { NotificationInboxScreen } from '@/modules/notification-inbox/NotificationInboxScreen';

export const metadata: Metadata = { title: copy.title };
export default function NotificationsPage() {
  return <NotificationInboxScreen />;
}
