import { z } from 'zod';
import { CommunityReportSchema } from './communityReport';
import { CommunityPageMetadataSchema } from './communityPageMetadata';

export const CommunityReportPageSchema = z.object({
  data: z.array(CommunityReportSchema),
  page: CommunityPageMetadataSchema,
});
export type CommunityReportPage = z.infer<typeof CommunityReportPageSchema>;
