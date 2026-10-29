import { z } from 'zod';
import { gentlePathEngagementStrings as copy } from '@/strings';
export const ResourceRatingInputSchema = z
  .object({
    rating: z
      .number()
      .int(copy.invalidRatingDescription)
      .min(1, copy.invalidRatingDescription)
      .max(5, copy.invalidRatingDescription),
  })
  .strict();
export const ResourceEngagementSchema = z.object({
  rating: z.number().int().min(1).max(5).nullable(),
  count: z.number().int().nonnegative(),
  average: z.number().min(1).max(5).nullable(),
});
export type ResourceRatingInput = z.infer<typeof ResourceRatingInputSchema>;
export type ResourceEngagement = z.infer<typeof ResourceEngagementSchema>;
