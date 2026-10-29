import { z } from 'zod';
import { NotificationCountsSchema } from './notificationCounts';

export const NotificationMutationResultSchema = z.object({
  affectedCount: z.number().int().nonnegative(),
  counts: NotificationCountsSchema,
});
export type NotificationMutationResult = z.infer<
  typeof NotificationMutationResultSchema
>;
