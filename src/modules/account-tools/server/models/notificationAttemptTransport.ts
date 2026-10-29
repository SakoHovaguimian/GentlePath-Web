import { z } from 'zod';
import { DeliveryStatusSchema } from '../../models/notificationDelivery';

export const NotificationAttemptTransportSchema = z.object({
  id: z.string().uuid(),
  attempt_number: z.number().int().positive(),
  started_at: z.string().datetime(),
  finished_at: z.string().datetime().nullable(),
  outcome: DeliveryStatusSchema,
  retryable: z.boolean().nullable(),
  error: z.string().nullable(),
});
export type NotificationAttemptTransport = z.infer<
  typeof NotificationAttemptTransportSchema
>;
