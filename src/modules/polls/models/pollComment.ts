import { z } from 'zod';
import { gentlePathPollStrings as copy } from '@/strings';
import { PollAuthorSchema } from './pollAuthor';

export const PollCommentInputSchema = z
  .object({
    body: z
      .string()
      .trim()
      .min(1, copy.validation.commentDescription)
      .max(20000, copy.validation.commentDescription),
  })
  .strict();
export const PollCommentSchema = z.object({
  id: z.string().uuid(),
  pollId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  author: PollAuthorSchema.nullable(),
  body: z.string(),
  likesCount: z.number().int().nonnegative(),
  liked: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PollComment = z.infer<typeof PollCommentSchema>;
export type PollCommentInput = z.infer<typeof PollCommentInputSchema>;
