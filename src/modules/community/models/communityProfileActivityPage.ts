import { z } from 'zod';
import { CommunityPageMetadataSchema } from './communityPageMetadata';
import { CommunityProfileActivitySchema } from './communityProfileActivity';

export const CommunityProfileActivityPageSchema = z.object({
  data: z.array(CommunityProfileActivitySchema),
  page: CommunityPageMetadataSchema,
});
export type CommunityProfileActivityPage = z.infer<
  typeof CommunityProfileActivityPageSchema
>;
