import { z } from 'zod';
import { CommunityPagingSchema } from './communityPaging';

export const CommunityReportQuerySchema = CommunityPagingSchema.extend({
  query: z.string().trim().max(200).default(''),
  status: z.enum(['open', 'in_review', 'resolved', 'dismissed']).optional(),
});
export type CommunityReportQuery = z.infer<typeof CommunityReportQuerySchema>;
