import { z } from 'zod';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { CommunityAuthorSchema } from './communityAuthor';

export const CommunityCommentInputSchema = z
  .object({
    parentCommentId: z.string().min(1).nullable().optional(),
    body: z
      .string()
      .trim()
      .min(1, copy.validation.comment)
      .max(20000, copy.validation.comment),
  })
  .strict();
export const CommunityCommentUpdateInputSchema =
  CommunityCommentInputSchema.omit({ parentCommentId: true });
export const CommunityCommentSchema = CommunityCommentInputSchema.extend({
  id: z.string(),
  postId: z.string(),
  parentCommentId: z.string().nullable().default(null),
  userId: z.string().nullable(),
  author: CommunityAuthorSchema.nullable(),
  likeCount: z.number().int().nonnegative(),
  liked: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CommunityComment = z.infer<typeof CommunityCommentSchema>;
export type CommunityCommentInput = z.infer<typeof CommunityCommentInputSchema>;
