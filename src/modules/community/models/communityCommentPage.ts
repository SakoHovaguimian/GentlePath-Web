import { z } from 'zod';
import { CommunityCommentSchema } from './communityComment';
import { CommunityPageMetadataSchema } from './communityPageMetadata';

export const CommunityCommentPageSchema = z.object({
  data: z.array(CommunityCommentSchema),
  page: CommunityPageMetadataSchema,
});
export type CommunityCommentPage = z.infer<typeof CommunityCommentPageSchema>;
