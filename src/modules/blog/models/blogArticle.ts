import { z } from 'zod';
import { gentlePathBlogStrings as copy } from '@/strings';
import { BlogCategorySchema } from './blogCategory';
import { BlogCoverSchema } from './blogCover';
import { BlogStatusSchema } from './blogStatus';
import { BlogContentsSchema } from './blogContent';
import { gentlePathBlogBuilderStrings as builderCopy } from '@/strings';

const BlogArticleFieldsSchema = z.object({
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
  body: z.string().trim().max(50000, copy.invalidBody).default(''),
  content: BlogContentsSchema.default([]),
  category: BlogCategorySchema,
  cover: BlogCoverSchema,
  status: BlogStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().nullable(),
  revision: z.number().int().min(1),
});
const hasArticleContent = (article: { body: string; content: unknown[] }) =>
  article.content.length > 0 || article.body.trim().length >= 40;
export const BlogArticleSchema = BlogArticleFieldsSchema.refine(
  hasArticleContent,
  { message: builderCopy.invalidContent, path: ['content'] },
);
export const BlogMutationInputSchema = BlogArticleFieldsSchema.pick({
  slug: true,
  title: true,
  description: true,
  author: true,
  body: true,
  content: true,
  category: true,
  cover: true,
})
  .extend({ revision: z.number().int().min(1).optional() })
  .refine(hasArticleContent, {
    message: builderCopy.invalidContent,
    path: ['content'],
  });
export const BlogRevisionInputSchema = z.object({
  revision: z.number().int().min(1),
});
export type BlogArticle = z.infer<typeof BlogArticleSchema>;
export type BlogMutationInput = z.infer<typeof BlogMutationInputSchema>;
