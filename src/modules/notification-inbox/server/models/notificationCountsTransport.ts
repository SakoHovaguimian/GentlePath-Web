import { z } from 'zod';

export const NotificationCountsTransportSchema = z.object({
  total_count: z.number().int().nonnegative(),
  unread_count: z.number().int().nonnegative(),
  read_count: z.number().int().nonnegative(),
});
export type NotificationCountsTransport = z.infer<
  typeof NotificationCountsTransportSchema
>;
