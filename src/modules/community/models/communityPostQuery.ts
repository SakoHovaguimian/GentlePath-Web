import { normalizeContentTag } from '@/utils/normalizeContentTag';
import { z } from 'zod';
import { PostKindSchema } from './postKind';
import { AgeBandSchema } from './ageBand';
import { USStateCodeSchema } from '@/modules/onboarding/models/usStateCode';
import { CommunityPagingSchema } from './communityPaging';

export const CommunityPostQuerySchema = CommunityPagingSchema.extend({
  query: z.string().trim().max(200).default(''),
  tag: z.string().trim().max(100).default('').transform(normalizeContentTag),
  postKind: PostKindSchema.optional(),
  ageBand: AgeBandSchema.optional(),
  stateCode: USStateCodeSchema.optional(),
  milestoneId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
  scope: z.enum(['all', 'mine']).default('all'),
});
export type CommunityPostQuery = z.infer<typeof CommunityPostQuerySchema>;
