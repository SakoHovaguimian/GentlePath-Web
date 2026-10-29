import { z } from 'zod';
import { NotificationInboxFiltersSchema } from './notificationInboxQuery';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';

export const NotificationReadInputSchema = z
  .object({ read: z.boolean() })
  .strict();
export const NotificationBulkReadInputSchema = z.discriminatedUnion('scope', [
  NotificationReadInputSchema.extend({ scope: z.literal('ALL') }),
  NotificationReadInputSchema.extend({
    scope: z.literal('SELECTED'),
    ids: z
      .array(z.string().uuid())
      .min(1)
      .max(100)
      .refine(
        (ids) => new Set(ids).size === ids.length,
        copy.validation.selection,
      ),
  }),
  NotificationReadInputSchema.extend({
    scope: z.literal('FILTERED'),
    filters: NotificationInboxFiltersSchema.refine(
      (value) => Object.values(value).some((item) => item !== undefined),
      copy.validation.filters,
    ),
  }),
]);
export type NotificationBulkReadInput = z.infer<
  typeof NotificationBulkReadInputSchema
>;
