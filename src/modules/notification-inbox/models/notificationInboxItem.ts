import { z } from 'zod';
import { NotificationCategorySchema } from './notificationCategory';

export const NotificationInboxItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  category: NotificationCategorySchema,
  title: z.string().max(200),
  body: z.string().max(4000),
  destination: z.string().max(2048).nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  publishedAt: z.iso.datetime({ offset: true }).nullable(),
  readAt: z.iso.datetime({ offset: true }).nullable(),
});
export type NotificationInboxItem = z.infer<typeof NotificationInboxItemSchema>;
