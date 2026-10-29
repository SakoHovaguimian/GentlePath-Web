import { z } from 'zod';
import { NotificationTimezoneSchema } from './notificationTimezone';

export const NotificationUserSettingsSchema = z.object({
  userId: z.string().uuid(),
  timezone: NotificationTimezoneSchema.nullable(),
  lastTimezone: NotificationTimezoneSchema.nullable(),
  lastTimezoneUpdatedAt: z.iso.datetime({ offset: true }).nullable(),
  effectiveTimezone: NotificationTimezoneSchema,
});
export type NotificationUserSettings = z.infer<
  typeof NotificationUserSettingsSchema
>;
