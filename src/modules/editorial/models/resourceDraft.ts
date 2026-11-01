import type { ResourceCategory } from '@/modules/portal/models/resource';
import { ResourceCategorySchema } from '@/modules/portal/models/resource';
import type { EditorialResource } from './editorialResource';
import type { EditorialResourceType } from './resourceType';
import type { EditorialResourceFormat } from './resourceFormat';

const empty = '';

export interface ResourceDraft {
  milestoneIds: string[];
  title: string;
  description: string;
  type: EditorialResourceType;
  format: EditorialResourceFormat | '';
  parentId: string;
  url: string;
  tags: string;
  stateCodes: string;
  officialSourceUrl: string;
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
      milestoneIds: [],
      title: empty,
      description: empty,
      type: 'ARTICLE',
      format: 'WEB_PAGE',
      parentId: empty,
      url: empty,
      tags: empty,
      stateCodes: empty,
      officialSourceUrl: empty,
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
    milestoneIds: resource.milestone_ids,
    title: resource.title,
    description: resource.description,
    type: resource.type,
    format: resource.format ?? '',
    parentId: resource.parent_id ?? '',
    url: resource.url ?? '',
    tags: resource.tags.join(', '),
    stateCodes: resource.state_codes.join(', '),
    officialSourceUrl: resource.official_source_url ?? '',
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
