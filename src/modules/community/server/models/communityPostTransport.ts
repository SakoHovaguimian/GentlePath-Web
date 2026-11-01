import { CommunityAttachmentsSchema } from '@/modules/community/models/communityAttachment';
import { z } from 'zod';
import { PostKindSchema } from '../../models/postKind';
import { AgeBandSchema } from '../../models/ageBand';
import { USStateCodeSchema } from '@/modules/onboarding/models/usStateCode';
import { MilestoneLinksSchema } from '@/modules/milestone-admin/models/milestoneLinks';
import { CommunityAuthorTransportSchema } from './communityAuthorTransport';

export const CommunityPostTransportSchema = z.object({
  post_kind: PostKindSchema,
  age_band: AgeBandSchema.nullable(),
  state_code: USStateCodeSchema.nullable(),
  milestone_ids: MilestoneLinksSchema.default([]),
  attachments: CommunityAttachmentsSchema.optional(),
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
