import { z } from 'zod';
import { BlogCategorySchema } from './blogCategory';
import { BlogStatusSchema } from './blogStatus';

export const BlogQuerySchema = z.object({
  query: z.string().trim().max(200).default(''),
  category: BlogCategorySchema.optional(),
  status: BlogStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(6),
  offset: z.coerce.number().int().min(0).default(0),
});
export type BlogQuery = z.infer<typeof BlogQuerySchema>;
export function blogQueryParams(query: BlogQuery) {
  const params = new URLSearchParams();
  if (query.query) params.set('query', query.query);
  if (query.category) params.set('category', query.category);
  if (query.status) params.set('status', query.status);
  params.set('limit', String(query.limit));
  params.set('offset', String(query.offset));
  return params;
}
export function blogQueryFromSearch(
  search: Record<string, string | string[] | undefined>,
  limit = 6,
): BlogQuery {
  const single = (key: string) =>
    typeof search[key] === 'string' ? search[key] : undefined;
  return BlogQuerySchema.parse({
    query: (single('query') || '').slice(0, 200),
    category: BlogCategorySchema.safeParse(single('category')).data,
    status: BlogStatusSchema.safeParse(single('status')).data,
    offset: Math.max(
      0,
      Math.min(100000, Number.parseInt(single('offset') || '0', 10) || 0),
    ),
    limit,
  });
}
