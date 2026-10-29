import { z } from 'zod';
import { CommunityAuthorTransportSchema } from './communityAuthorTransport';

export const CommunityPostTransportSchema = z.object({
  id: z.string(),
  content_type: z.literal('POST'),
  user_id: z.string().nullable(),
  title: z.string(),
  body: z.string(),
  image_url: z.string().nullable(),
  tags: z.array(z.string()),
  author: CommunityAuthorTransportSchema.nullish(),
  likes_count: z.number().int().nonnegative().optional(),
  comments_count: z.number().int().nonnegative().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type CommunityPostTransport = z.infer<
  typeof CommunityPostTransportSchema
>;
