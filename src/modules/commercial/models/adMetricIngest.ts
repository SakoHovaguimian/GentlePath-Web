import { z } from 'zod';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { AdLocaleSchema, AdPlatformSchema } from './adCreative';
export const AdMetricIngestSchema = z
  .object({
    placement_item_id: z.string().uuid(),
    metric_date: z.string().date(),
    locale: AdLocaleSchema,
    platform: AdPlatformSchema,
    impressions: z.number().int().min(0).max(100).default(0),
    clicks: z.number().int().min(0).max(100).default(0),
    code_copies: z.number().int().min(0).max(100).default(0),
  })
  .strict()
  .refine(
    (value) => value.impressions + value.clicks + value.code_copies > 0,
    copy.validation.metric,
  );
export type AdMetricIngest = z.infer<typeof AdMetricIngestSchema>;
