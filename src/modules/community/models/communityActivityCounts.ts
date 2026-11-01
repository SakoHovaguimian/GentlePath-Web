import { z } from 'zod';

export const CommunityActivityCountsSchema = z.object({
  posts: z.number().int().nonnegative(),
  polls: z.number().int().nonnegative(),
  tips: z.number().int().nonnegative(),
  comments: z.number().int().nonnegative(),
});
export type CommunityActivityCounts = z.infer<
  typeof CommunityActivityCountsSchema
>;
