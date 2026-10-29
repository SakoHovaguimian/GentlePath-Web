import { z } from 'zod';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';

export const NotificationTimezoneSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .refine((value) => {
    if (/^[+-]/.test(value)) return false;
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
      return true;
    } catch {
      return false;
    }
  }, copy.validation.timezone);
export const NotificationTimezoneInputSchema = z
  .object({ timezone: NotificationTimezoneSchema.nullable() })
  .strict();
export const NotificationDetectedTimezoneInputSchema = z
  .object({ lastTimezone: NotificationTimezoneSchema })
  .strict();
