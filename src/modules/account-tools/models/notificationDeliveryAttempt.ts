import { z } from 'zod';
import { DeliveryStatusSchema } from './notificationDelivery';

export const NotificationDeliveryAttemptSchema = z.object({
  id: z.string().uuid(),
  attemptNumber: z.number().int().positive(),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullable(),
  outcome: DeliveryStatusSchema,
  retryable: z.boolean().nullable(),
  error: z.string().nullable(),
});
export type NotificationDeliveryAttempt = z.infer<
  typeof NotificationDeliveryAttemptSchema
>;
