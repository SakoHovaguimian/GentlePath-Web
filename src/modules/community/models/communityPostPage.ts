import { z } from 'zod';
import { CommunityPostSchema } from './communityPost';
import { CommunityPageMetadataSchema } from './communityPageMetadata';

export const CommunityPostPageSchema = z.object({
  data: z.array(CommunityPostSchema),
  page: CommunityPageMetadataSchema,
});
export type CommunityPostPage = z.infer<typeof CommunityPostPageSchema>;
