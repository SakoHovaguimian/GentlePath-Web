import { z } from 'zod';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import { NotificationCategorySchema } from './notificationCategory';
import { NotificationChannelSchema } from './notificationChannel';

export const NotificationPreferenceSchema = z
  .object({
    category: NotificationCategorySchema,
    channel: NotificationChannelSchema,
    enabled: z.boolean(),
  })
  .strict();
export type NotificationPreference = z.infer<
  typeof NotificationPreferenceSchema
>;
export const NotificationPreferencesInputSchema = z
  .object({
    preferences: z
      .array(NotificationPreferenceSchema)
      .min(1)
      .max(12)
      .refine(
        (values) =>
          new Set(values.map((value) => `${value.category}:${value.channel}`))
            .size === values.length,
        copy.validation.preferences,
      ),
  })
  .strict();
export type NotificationPreferencesInput = z.infer<
  typeof NotificationPreferencesInputSchema
>;
