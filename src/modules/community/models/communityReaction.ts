import { z } from 'zod';

export const CommunityReactionInputSchema = z
  .object({ liked: z.boolean() })
  .strict();
export const CommunityReactionSchema = CommunityReactionInputSchema.extend({
  likeCount: z.number().int().nonnegative(),
});
export type CommunityReactionInput = z.infer<
  typeof CommunityReactionInputSchema
>;
export type CommunityReaction = z.infer<typeof CommunityReactionSchema>;
