import type { NotificationPreference } from '../../models/notificationPreference';
import type { NotificationUserSettings } from '../../models/notificationUserSettings';
import type { DemoInboxNotification } from './demoInboxNotification';

export interface DemoNotificationInboxState {
  notifications: DemoInboxNotification[];
  preferences: Map<string, NotificationPreference[]>;
  settings: Map<string, NotificationUserSettings>;
}
