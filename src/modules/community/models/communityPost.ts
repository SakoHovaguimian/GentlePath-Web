import { normalizeContentTag } from '@/utils/normalizeContentTag';
import { z } from 'zod';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { CommunityAuthorSchema } from './communityAuthor';
import { CommunityPublicUrlSchema } from './communityPublicUrl';

export const CommunityPostInputSchema = z
  .object({
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
export const CommunityPostSchema = CommunityPostInputSchema.extend({
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
