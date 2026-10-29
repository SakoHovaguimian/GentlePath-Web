import { z } from 'zod';

export const DeliveryStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'ACCEPTED',
  'SKIPPED',
  'FAILED',
  'UNKNOWN',
]);
export const NotificationDeliverySchema = z.object({
  id: z.string().uuid(),
  notificationId: z.string().uuid(),
  channel: z.enum(['PUSH', 'EMAIL']),
  status: DeliveryStatusSchema,
  attemptCount: z.number().int().nonnegative(),
  nextAttemptAt: z.string().datetime().nullable(),
  acceptedAt: z.string().datetime().nullable(),
  error: z.string().nullable(),
  skipReason: z.string().nullable(),
  createdAt: z.string().datetime().nullable(),
});
export type NotificationDelivery = z.infer<typeof NotificationDeliverySchema>;
