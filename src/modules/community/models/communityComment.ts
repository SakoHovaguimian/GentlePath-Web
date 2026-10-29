import { z } from 'zod';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { CommunityAuthorSchema } from './communityAuthor';

export const CommunityCommentInputSchema = z
  .object({
    body: z
      .string()
      .trim()
      .min(1, copy.validation.comment)
      .max(20000, copy.validation.comment),
  })
  .strict();
export const CommunityCommentSchema = CommunityCommentInputSchema.extend({
  id: z.string(),
  postId: z.string(),
  userId: z.string().nullable(),
  author: CommunityAuthorSchema.nullable(),
  likeCount: z.number().int().nonnegative(),
  liked: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CommunityComment = z.infer<typeof CommunityCommentSchema>;
export type CommunityCommentInput = z.infer<typeof CommunityCommentInputSchema>;
