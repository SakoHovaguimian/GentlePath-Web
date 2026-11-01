import { CommunityAttachmentsSchema } from '@/modules/community/models/communityAttachment';
import { normalizeContentTag } from '@/utils/normalizeContentTag';
import { z } from 'zod';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { CommunityAuthorSchema } from './communityAuthor';
import { CommunityPublicUrlSchema } from './communityPublicUrl';
import { PostKindSchema } from './postKind';
import { AgeBandSchema } from './ageBand';
import { USStateCodeSchema } from '@/modules/onboarding/models/usStateCode';
import { MilestoneLinksSchema } from '@/modules/milestone-admin/models/milestoneLinks';

export const CommunityPostInputSchema = z
  .object({
    postKind: PostKindSchema.optional(),
    milestoneIds: MilestoneLinksSchema.optional(),
    childId: z.string().min(1).optional(),
    title: z
      .string()
      .trim()
      .min(1, copy.validation.title)
      .max(500, copy.validation.title),
    body: z
      .string()
      .trim()
      .min(1, copy.validation.body)
      .max(20000, copy.validation.body),
    attachments: CommunityAttachmentsSchema.optional(),
    imageUrl: CommunityPublicUrlSchema.nullable(),
    tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, copy.validation.tags)
          .max(100, copy.validation.tags)
          .transform(normalizeContentTag)
          .refine((tag) => tag.length <= 100, copy.validation.tags),
      )
      .max(30, copy.validation.tags)
      .refine(
        (tags) =>
          new Set(tags.map((tag) => tag.toLocaleLowerCase('en-US'))).size ===
          tags.length,
        copy.validation.tags,
      ),
  })
  .strict();
export const CommunityPostUpdateInputSchema = CommunityPostInputSchema.omit({
  childId: true,
});
export const CommunityPostSchema = CommunityPostUpdateInputSchema.extend({
  postKind: PostKindSchema.default('DISCUSSION'),
  milestoneIds: MilestoneLinksSchema.default([]),
  stateCode: USStateCodeSchema.nullable().default(null),
  ageBand: AgeBandSchema.nullable().default(null),
  attachments: CommunityAttachmentsSchema.default([]),
  id: z.string(),
  userId: z.string().nullable(),
  author: CommunityAuthorSchema.nullable(),
  likeCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),
  liked: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CommunityPost = z.infer<typeof CommunityPostSchema>;
export type CommunityPostInput = z.infer<typeof CommunityPostInputSchema>;
