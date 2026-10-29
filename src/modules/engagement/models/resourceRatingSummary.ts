import { z } from 'zod';

export const ResourceRatingSummarySchema = z.object({
  count: z.number().int().nonnegative(),
  average: z.number().min(1).max(5).nullable(),
});

export type ResourceRatingSummary = z.infer<typeof ResourceRatingSummarySchema>;
