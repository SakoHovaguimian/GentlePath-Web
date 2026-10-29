import type { NotificationDelivery } from '../../models/notificationDelivery';
import type { NotificationDeliveryAttempt } from '../../models/notificationDeliveryAttempt';
import type { AIUsageEvent } from '../../models/aiUsageEvent';
import type { DemoAccountDevice } from './demoAccountDevice';

export interface DemoAccountToolsState {
  devices: DemoAccountDevice[];
  deliveries: NotificationDelivery[];
  attempts: Map<string, NotificationDeliveryAttempt[]>;
  aiUsage: AIUsageEvent[];
}
