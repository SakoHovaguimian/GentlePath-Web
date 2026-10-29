import { z } from 'zod';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { EditorialResourceTypeSchema } from './resourceType';

export const EditorialQuerySchema = z
  .object({
    query: z.string().trim().max(500).default(''),
    limit: z.coerce.number().int().min(1).max(100).default(9),
    offset: z.coerce.number().int().nonnegative().safe().default(0),
    type: EditorialResourceTypeSchema.optional(),
    parent_id: z.string().min(1).optional(),
    root_only: z.boolean().optional(),
  })
  .refine(
    (query) => !(query.parent_id && query.root_only),
    copy.validation.parentFilterDescription,
  );
export type EditorialQuery = z.infer<typeof EditorialQuerySchema>;

export function editorialQueryParams(query: EditorialQuery) {
  const params = new URLSearchParams({
    limit: String(query.limit),
    offset: String(query.offset),
  });
  if (query.query) params.set('query', query.query);
  if (query.type) params.set('type', query.type);
  if (query.parent_id) params.set('parent_id', query.parent_id);
  if (query.root_only) params.set('root_only', 'true');
  return params.toString();
}
export function editorialQueryFromSearch(
  search: Record<string, string | string[] | undefined>,
): EditorialQuery {
  const first = (key: string) =>
    typeof search[key] === 'string' ? search[key] : undefined;
  const result = EditorialQuerySchema.safeParse({
    query: first('query'),
    type: first('type'),
    parent_id: first('parent_id'),
    root_only: first('root_only') === 'true' || undefined,
    limit: first('limit'),
    offset: first('offset'),
  });
  return result.success ? result.data : EditorialQuerySchema.parse({});
}
