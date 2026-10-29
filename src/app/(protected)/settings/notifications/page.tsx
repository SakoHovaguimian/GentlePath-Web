import type { Metadata } from 'next';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import { NotificationSettingsScreen } from '@/modules/notification-inbox/NotificationSettingsScreen';

export const metadata: Metadata = { title: copy.preferencesTitle };
export default function NotificationSettingsPage() {
  return <NotificationSettingsScreen />;
}
