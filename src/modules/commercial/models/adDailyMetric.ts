import { z } from 'zod';
import { dateTime } from './commercialValidation';
export const AdDailyMetricSchema = z.object({
  id: z.string().uuid(),
  placement_item_id: z.string().uuid(),
  metric_date: z.string().date(),
  impressions: z.number().int().nonnegative(),
  clicks: z.number().int().nonnegative(),
  code_copies: z.number().int().nonnegative(),
  created_at: dateTime,
  updated_at: dateTime,
});
export type AdDailyMetric = z.infer<typeof AdDailyMetricSchema>;
