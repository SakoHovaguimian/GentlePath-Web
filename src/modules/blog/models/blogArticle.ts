import { z } from 'zod';
import { gentlePathBlogStrings as copy } from '@/strings';
import { BlogCategorySchema } from './blogCategory';
import { BlogCoverSchema } from './blogCover';
import { BlogStatusSchema } from './blogStatus';

export const BlogArticleSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .trim()
    .min(3, copy.invalidSlug)
    .max(100, copy.invalidSlug)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, copy.invalidSlug),
  title: z
    .string()
    .trim()
    .min(3, copy.invalidTitle)
    .max(140, copy.invalidTitle),
  description: z
    .string()
    .trim()
    .min(20, copy.invalidDescription)
    .max(350, copy.invalidDescription),
  author: z
    .string()
    .trim()
    .min(2, copy.invalidAuthor)
    .max(100, copy.invalidAuthor),
  body: z
    .string()
    .trim()
    .min(40, copy.invalidBody)
    .max(50000, copy.invalidBody),
  category: BlogCategorySchema,
  cover: BlogCoverSchema,
  status: BlogStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().nullable(),
  revision: z.number().int().min(1),
});
export const BlogMutationInputSchema = BlogArticleSchema.pick({
  slug: true,
  title: true,
  description: true,
  author: true,
  body: true,
  category: true,
  cover: true,
}).extend({ revision: z.number().int().min(1).optional() });
export const BlogRevisionInputSchema = z.object({
  revision: z.number().int().min(1),
});
export type BlogArticle = z.infer<typeof BlogArticleSchema>;
export type BlogMutationInput = z.infer<typeof BlogMutationInputSchema>;
