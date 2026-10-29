import { z } from 'zod';
import { NotificationInboxItemSchema } from './notificationInboxItem';

export const NotificationPageSchema = z.object({
  data: z.array(NotificationInboxItemSchema),
  page: z.object({
    limit: z.number().int().min(1).max(100),
    offset: z.number().int().nonnegative().safe(),
    hasMore: z.boolean(),
    nextOffset: z.number().int().nonnegative().safe().nullable(),
  }),
});
export type NotificationPage = z.infer<typeof NotificationPageSchema>;
