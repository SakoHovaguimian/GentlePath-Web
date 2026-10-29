import { z } from 'zod';
export const BlogEngagementSchema = z.object({
  liked: z.boolean(),
  likesCount: z.number().int().nonnegative(),
  saved: z.boolean(),
});
export type BlogEngagement = z.infer<typeof BlogEngagementSchema>;
