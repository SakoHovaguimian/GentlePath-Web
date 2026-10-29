import { z } from 'zod';
export const EngagementPageMetadataSchema = z.object({
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().nonnegative().safe(),
  hasMore: z.boolean(),
  nextOffset: z.number().int().nonnegative().safe().nullable(),
});
