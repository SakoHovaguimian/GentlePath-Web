import { z } from 'zod';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { CommunityReportSnapshotSchema } from './communityReportSnapshot';
import { CommunityContentKindSchema } from './communityContentKind';

export const CommunityReportInputSchema = z
  .object({
    targetType: z.enum(['post', 'post_comment']),
    targetId: z.string().min(1),
    reason: z
      .string()
      .trim()
      .min(1, copy.validation.reason)
      .max(10000, copy.validation.reason),
  })
  .strict();
export const CommunityReportSchema = CommunityReportInputSchema.extend({
  targetType: CommunityContentKindSchema,
  id: z.string(),
  userId: z.string().nullable(),
  snapshot: CommunityReportSnapshotSchema,
  status: z.enum(['open', 'in_review', 'resolved', 'dismissed']),
  resolutionNote: z.string().nullable(),
  reviewerId: z.string().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type CommunityReport = z.infer<typeof CommunityReportSchema>;
export type CommunityReportInput = z.infer<typeof CommunityReportInputSchema>;
