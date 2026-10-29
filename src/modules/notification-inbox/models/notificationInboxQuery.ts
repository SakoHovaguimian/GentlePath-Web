import { z } from 'zod';
import { NotificationCategorySchema } from './notificationCategory';

export const NotificationInboxFiltersSchema = z
  .object({
    query: z.string().trim().min(1).max(200).optional(),
    category: NotificationCategorySchema.optional(),
    read: z.boolean().optional(),
  })
  .strict();
export type NotificationInboxFilters = z.infer<
  typeof NotificationInboxFiltersSchema
>;

export const NotificationInboxQuerySchema =
  NotificationInboxFiltersSchema.extend({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }).strict();
export type NotificationInboxQuery = z.infer<
  typeof NotificationInboxQuerySchema
>;

export function readNotificationInboxQuery(params: URLSearchParams) {
  const input = Object.fromEntries(params);
  return NotificationInboxQuerySchema.parse({
    ...input,
    ...(input.read === undefined
      ? {}
      : { read: z.enum(['true', 'false']).parse(input.read) === 'true' }),
  });
}
