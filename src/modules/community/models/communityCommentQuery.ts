import { z } from 'zod';
import { CommunityPagingSchema } from './communityPaging';
import { gentlePathCommunityStrings as copy } from '@/strings';

export const CommunityCommentQuerySchema = CommunityPagingSchema.extend({
  rootOnly: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .or(z.boolean())
    .optional(),
  parentCommentId: z.string().min(1).optional(),
}).refine(
  (value) => !value.rootOnly || !value.parentCommentId,
  copy.validation.replyParent,
);
export type CommunityCommentQuery = z.infer<typeof CommunityCommentQuerySchema>;
