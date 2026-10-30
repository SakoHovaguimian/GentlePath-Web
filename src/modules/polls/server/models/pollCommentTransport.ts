import { z } from 'zod';
import { PollAuthorTransportSchema } from './pollAuthorTransport';
export const PollCommentTransportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  poll_id: z.string().uuid(),
  parent_comment_id: z.string().nullable().optional(),
  body: z.string(),
  author: PollAuthorTransportSchema.nullable().optional(),
  likes_count: z.number().int().nonnegative().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
