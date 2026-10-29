import { z } from 'zod';
import { CommunityAuthorTransportSchema } from './communityAuthorTransport';

const kind = z.enum([
  'POST',
  'POST_COMMENT',
  'BLOG',
  'POLL',
  'POLL_COMMENT',
  'TIP',
  'RESOURCE',
  'MILESTONE',
  'GUIDED_STEP',
]);
export const CommunityReportTransportSchema = z.object({
  id: z.string(),
  user_id: z.string().nullable(),
  target_id: z.string(),
  target_type: kind,
  reason: z.string(),
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED']),
  resolution_notes: z.string().nullable(),
  reviewed_by_user_id: z.string().nullable(),
  reviewed_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  target_snapshot: z.object({
    id: z.string(),
    content_type: kind,
    title: z.string().nullable(),
    body: z.string().nullable(),
    tags: z.array(z.string()).optional(),
    image_url: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    parent_id: z.string().nullable(),
    author: CommunityAuthorTransportSchema.nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  }),
});
export type CommunityReportTransport = z.infer<
  typeof CommunityReportTransportSchema
>;
