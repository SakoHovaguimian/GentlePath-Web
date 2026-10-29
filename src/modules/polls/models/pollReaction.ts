import { z } from 'zod';

export const PollReactionInputSchema = z
  .object({ liked: z.boolean() })
  .strict();
export const PollReactionSchema = z.object({
  liked: z.boolean(),
  likesCount: z.number().int().nonnegative(),
});
