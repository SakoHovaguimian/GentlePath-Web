import { z } from 'zod';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import { AccountToolsPagingSchema } from './accountToolsPaging';
import { DeliveryStatusSchema } from './notificationDelivery';

export const NotificationDeliveryQuerySchema = AccountToolsPagingSchema.extend({
  notificationId: z.string().uuid().optional(),
  status: DeliveryStatusSchema.optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
})
  .strict()
  .refine(
    (value) =>
      !value.createdAfter ||
      !value.createdBefore ||
      value.createdAfter <= value.createdBefore,
    { path: ['createdBefore'], message: copy.validation.dateRange },
  );
export type NotificationDeliveryQuery = z.infer<
  typeof NotificationDeliveryQuerySchema
>;
