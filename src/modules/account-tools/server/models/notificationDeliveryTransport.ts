import { z } from 'zod';
import { DeliveryStatusSchema } from '../../models/notificationDelivery';

export const NotificationDeliveryTransportSchema = z.object({
  id: z.string().uuid(),
  notification_id: z.string().uuid(),
  channel: z.enum(['PUSH', 'EMAIL']),
  status: DeliveryStatusSchema,
  attempt_count: z.number().int().nonnegative(),
  next_attempt_at: z.string().datetime().nullable(),
  accepted_at: z.string().datetime().nullable(),
  error: z.string().nullable(),
  skip_reason: z.string().nullable(),
  created_at: z.string().datetime().nullable(),
});
export type NotificationDeliveryTransport = z.infer<
  typeof NotificationDeliveryTransportSchema
>;
