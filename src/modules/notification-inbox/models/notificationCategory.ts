import { z } from 'zod';

export const NotificationCategorySchema = z.enum([
  'ACTIVITY',
  'MENTION',
  'TAG',
  'PRODUCT_UPDATE',
]);
export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;
