import { z } from 'zod';

export const CommunityPagingSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(9),
  offset: z.coerce.number().int().nonnegative().safe().default(0),
});
export type CommunityPaging = z.infer<typeof CommunityPagingSchema>;
