import { z } from 'zod';
import { NotificationInboxFiltersSchema } from './notificationInboxQuery';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';

export const NotificationArchiveInputSchema = z.discriminatedUnion('scope', [
  z.object({ scope: z.literal('ALL') }).strict(),
  z
    .object({
      scope: z.literal('FILTERED'),
      filters: NotificationInboxFiltersSchema.refine(
        (value) => Object.values(value).some((item) => item !== undefined),
        copy.validation.filters,
      ),
    })
    .strict(),
]);
export type NotificationArchiveInput = z.infer<
  typeof NotificationArchiveInputSchema
>;
