import type { MessagingConfig } from '@/services/notifications/models/messagingConfig';
export interface RuntimeConfig {
  demoMode: boolean;
  devSettingsEnabled?: boolean;
  socketUrl: string | null;
  messaging: MessagingConfig | null;
  amplitudeApiKey: string | null;
}
