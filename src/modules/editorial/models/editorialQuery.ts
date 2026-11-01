import { z } from 'zod';
import { USStateCodeSchema } from '@/modules/onboarding/models/usStateCode';
import {
  gentlePathEditorialDiscoveryStrings as discovery,
  gentlePathEditorialStrings as copy,
} from '@/strings';
import { EditorialResourceTypeSchema } from './resourceType';

export const EditorialQuerySchema = z
  .object({
    query: z.string().trim().max(500).default(''),
    limit: z.coerce.number().int().min(1).max(100).default(9),
    offset: z.coerce.number().int().nonnegative().safe().default(0),
    milestone_id: z.string().min(1).optional(),
    state_code: USStateCodeSchema.optional(),
    type: EditorialResourceTypeSchema.optional(),
    parent_id: z.string().min(1).optional(),
    root_only: z.boolean().optional(),
    exclude_collections: z.boolean().optional(),
  })
  .refine(
    (query) => !(query.parent_id && query.root_only),
    copy.validation.parentFilterDescription,
  )
  .refine(
    (query) => !(query.type === 'COLLECTION' && query.exclude_collections),
    discovery.collectionFilterDescription,
  );
export type EditorialQuery = z.infer<typeof EditorialQuerySchema>;

export function editorialQueryParams(query: EditorialQuery) {
  const params = new URLSearchParams({
    limit: String(query.limit),
    offset: String(query.offset),
  });
  if (query.query) params.set('query', query.query);
  if (query.milestone_id) params.set('milestone_id', query.milestone_id);
  if (query.state_code) params.set('state_code', query.state_code);
  if (query.type) params.set('type', query.type);
  if (query.parent_id) params.set('parent_id', query.parent_id);
  if (query.exclude_collections) params.set('exclude_collections', 'true');
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
    milestone_id: first('milestone_id'),
    state_code: first('state_code'),
    exclude_collections: first('exclude_collections') === 'true' || undefined,
    type: first('type'),
    parent_id: first('parent_id'),
    root_only: first('root_only') === 'true' || undefined,
    limit: first('limit'),
    offset: first('offset'),
  });
  return result.success ? result.data : EditorialQuerySchema.parse({});
}
