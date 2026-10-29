import { z } from 'zod';
import { CommunityPagingSchema } from './communityPaging';

export const CommunityPostQuerySchema = CommunityPagingSchema.extend({
  query: z.string().trim().max(200).default(''),
  tag: z.string().trim().max(100).default(''),
  scope: z.enum(['all', 'mine']).default('all'),
});
export type CommunityPostQuery = z.infer<typeof CommunityPostQuerySchema>;
