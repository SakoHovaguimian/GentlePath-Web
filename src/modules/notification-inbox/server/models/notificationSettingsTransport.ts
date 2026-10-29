import { z } from 'zod';
import { NotificationTimezoneSchema } from '../../models/notificationTimezone';

export const NotificationSettingsTransportSchema = z.object({
  user_id: z.string().uuid(),
  timezone: NotificationTimezoneSchema.nullable(),
  last_timezone: NotificationTimezoneSchema.nullable(),
  last_timezone_updated_at: z.iso.datetime({ offset: true }).nullable(),
  effective_timezone: NotificationTimezoneSchema,
});
export type NotificationSettingsTransport = z.infer<
  typeof NotificationSettingsTransportSchema
>;
