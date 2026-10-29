import type { NotificationStatus } from '@/services/notifications/models/notificationStatus';
import type { LogoutPreparation } from './logoutPreparation';
export interface RealtimeContextValue {
  status: 'demo' | 'connecting' | 'connected' | 'offline';
  notificationStatus: NotificationStatus;
  enableNotifications(): Promise<void>;
  disableNotifications(): Promise<void>;
  prepareForLogout(options?: LogoutPreparation): Promise<void>;
  simulateAlert(): void;
}
