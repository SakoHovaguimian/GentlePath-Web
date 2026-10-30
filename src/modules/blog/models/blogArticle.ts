import { z } from 'zod';
import { gentlePathBlogStrings as copy } from '@/strings';
import { BlogCategorySchema } from './blogCategory';
import { BlogCoverSchema } from './blogCover';
import { BlogStatusSchema } from './blogStatus';
import { BlogContentsSchema } from './blogContent';
import { StoredBlogContentsSchema } from './storedBlogContent';
import { gentlePathBlogBuilderStrings as builderCopy } from '@/strings';

const BlogArticleFieldsSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .trim()
    .min(3, copy.invalidSlug)
    .max(100, copy.invalidSlug)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, copy.invalidSlug),
  title: z.string().min(1, copy.invalidTitle).max(500, copy.invalidTitle),
  description: z
    .string()
    .min(1, copy.invalidDescription)
    .max(20000, copy.invalidDescription),
  author: z
    .string()
    .trim()
    .min(2, copy.invalidAuthor)
    .max(100, copy.invalidAuthor),
  content: StoredBlogContentsSchema.default([]),
  // Older deployed responses may still include writing awaiting migration.
  body: z.string().max(50000, copy.invalidBody).optional(),
  category: BlogCategorySchema,
  cover: BlogCoverSchema,
  status: BlogStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().nullable(),
  revision: z.number().int().min(1),
});
export const BlogArticleSchema = BlogArticleFieldsSchema;
export const BlogMutationInputSchema = BlogArticleFieldsSchema.pick({
  slug: true,
  title: true,
  description: true,
  author: true,
  category: true,
  cover: true,
})
  .extend({
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
    content: BlogContentsSchema,
    revision: z.number().int().min(1).optional(),
  })
  .strict()
  .refine((article) => article.content.length > 0, {
    message: builderCopy.invalidContent,
    path: ['content'],
  });
export const BlogRevisionInputSchema = z.object({
  revision: z.number().int().min(1),
});
export type BlogArticle = z.infer<typeof BlogArticleSchema>;
export type BlogMutationInput = z.infer<typeof BlogMutationInputSchema>;
export type BlogArticleDraft = Pick<
  BlogArticle,
  | 'slug'
  | 'title'
  | 'description'
  | 'author'
  | 'content'
  | 'category'
  | 'cover'
  | 'body'
> & { revision?: number };
