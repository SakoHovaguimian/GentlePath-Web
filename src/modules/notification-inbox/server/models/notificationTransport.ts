import { z } from 'zod';
import { NotificationCategorySchema } from '../../models/notificationCategory';

export const NotificationTransportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  category: NotificationCategorySchema,
  title: z.string().max(200),
  body: z.string().max(4000),
  destination: z.string().max(2048).nullable(),
  created_at: z.iso.datetime({ offset: true }),
  published_at: z.iso.datetime({ offset: true }).nullable(),
  read_at: z.iso.datetime({ offset: true }).nullable(),
});
export type NotificationTransport = z.infer<typeof NotificationTransportSchema>;
