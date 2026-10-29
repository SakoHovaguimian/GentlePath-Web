import type { ResourceCategory } from '@/modules/portal/models/resource';
import { ResourceCategorySchema } from '@/modules/portal/models/resource';
import type { EditorialResource } from './editorialResource';
import type { EditorialResourceType } from './resourceType';
import type { EditorialResourceFormat } from './resourceFormat';

const empty = '';

export interface ResourceDraft {
  title: string;
  description: string;
  type: EditorialResourceType;
  format: EditorialResourceFormat | '';
  parentId: string;
  url: string;
  tags: string;
  category: ResourceCategory;
  minutes: string;
  sourceName: string;
  sourceUrl: string;
  sourceDate: string;
  metadataText: string;
}
export function createResourceDraft(
  resource?: EditorialResource,
): ResourceDraft {
  if (!resource)
    return {
      title: empty,
      description: empty,
      type: 'ARTICLE',
      format: 'WEB_PAGE',
      parentId: empty,
      url: empty,
      tags: empty,
      category: 'everyday',
      minutes: '5',
      sourceName: empty,
      sourceUrl: empty,
      sourceDate: empty,
      metadataText: '{}',
    };
  const details = resource.resource_details;
  const extra = { ...details.additional_properties };
  delete extra.family_category;
  delete extra.estimated_minutes;
  const category = ResourceCategorySchema.safeParse(
    details.additional_properties.family_category,
  );
  return {
    title: resource.title,
    description: resource.description,
    type: resource.type,
    format: resource.format ?? '',
    parentId: resource.parent_id ?? '',
    url: resource.url ?? '',
    tags: resource.tags.join(', '),
    category: category.success ? category.data : 'everyday',
    minutes:
      typeof details.additional_properties.estimated_minutes === 'number'
        ? String(details.additional_properties.estimated_minutes)
        : '5',
    sourceName: details.source_name ?? '',
    sourceUrl: details.source_url ?? '',
    sourceDate: details.source_published_at ?? '',
    metadataText: JSON.stringify(extra, null, 2),
  };
}
