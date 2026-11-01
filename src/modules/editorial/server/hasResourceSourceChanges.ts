import 'server-only';
import { isDeepStrictEqual } from 'node:util';
import type {
  EditorialResource,
  EditorialResourceInput,
} from '../models/editorialResource';

export function hasResourceSourceChanges(
  resource: EditorialResource,
  input: EditorialResourceInput,
) {
  const fields = [
    'parent_id',
    'type',
    'format',
    'title',
    'description',
    'url',
    'tags',
    'state_codes',
    'official_source_url',
  ] as const;
  return (
    fields.some((key) => !isDeepStrictEqual(resource[key], input[key])) ||
    !isDeepStrictEqual(
      {
        source_name: resource.resource_details.source_name,
        source_url: resource.resource_details.source_url,
        source_published_at: resource.resource_details.source_published_at,
        additional_properties: resource.resource_details.additional_properties,
      },
      input.resource_details,
    )
  );
}
