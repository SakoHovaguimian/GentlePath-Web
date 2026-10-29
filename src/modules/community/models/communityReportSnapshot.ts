import { z } from 'zod';
import { CommunityAuthorSchema } from './communityAuthor';
import { CommunityContentKindSchema } from './communityContentKind';
import { CommunityPublicUrlSchema } from './communityPublicUrl';

export const CommunityReportSnapshotSchema = z.object({
  id: z.string(),
  targetType: CommunityContentKindSchema,
  title: z.string().nullable(),
  body: z.string().nullable(),
  tags: z.array(z.string()).optional(),
  imageUrl: CommunityPublicUrlSchema.nullable().optional(),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable(),
  author: CommunityAuthorSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CommunityReportSnapshot = z.infer<
  typeof CommunityReportSnapshotSchema
>;
