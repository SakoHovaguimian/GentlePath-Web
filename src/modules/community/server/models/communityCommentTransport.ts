import { z } from 'zod';
import { CommunityAuthorTransportSchema } from './communityAuthorTransport';

export const CommunityCommentTransportSchema = z.object({
  id: z.string(),
  content_type: z.literal('POST_COMMENT'),
  user_id: z.string().nullable(),
  post_id: z.string(),
  parent_comment_id: z.string().nullable().optional(),
  body: z.string(),
  author: CommunityAuthorTransportSchema.nullish(),
  likes_count: z.number().int().nonnegative().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type CommunityCommentTransport = z.infer<
  typeof CommunityCommentTransportSchema
>;
