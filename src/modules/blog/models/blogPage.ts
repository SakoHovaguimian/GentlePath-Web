import { z } from 'zod';
import { BlogArticleSchema } from './blogArticle';

export const BlogPageSchema = z.object({
  data: z.array(BlogArticleSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});
export type BlogPage = z.infer<typeof BlogPageSchema>;
