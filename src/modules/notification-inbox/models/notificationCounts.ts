import { z } from 'zod';

export const NotificationCountsSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  unreadCount: z.number().int().nonnegative(),
  readCount: z.number().int().nonnegative(),
});
export type NotificationCounts = z.infer<typeof NotificationCountsSchema>;
