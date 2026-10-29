import type { Resource } from '@/modules/portal/models/resource';
import { ResourceCategorySchema } from '@/modules/portal/models/resource';
import type { EditorialResource } from '../models/editorialResource';

export function mapEditorialResourceToPortal(
  resource: EditorialResource,
  saved: boolean,
): Resource {
  const metadata = resource.resource_details.additional_properties;
  const category = ResourceCategorySchema.safeParse(metadata.family_category);
  const minutes =
    typeof metadata.estimated_minutes === 'number' &&
    Number.isFinite(metadata.estimated_minutes)
      ? Math.min(1440, Math.max(0, metadata.estimated_minutes))
      : 5;
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    category: category.success ? category.data : 'everyday',
    format:
      resource.type === 'GUIDE'
        ? 'guide'
        : resource.type === 'TOOLKIT' || resource.type === 'COLLECTION'
          ? 'toolkit'
          : 'article',
    readMinutes: minutes,
    body:
      typeof metadata.body === 'string' ? metadata.body : resource.description,
    saved,
    parentId: resource.parent_id,
    resourceType: resource.type,
    sourceName: resource.resource_details.source_name,
    sourceUrl: resource.resource_details.source_url,
    sourcePublishedAt: resource.resource_details.source_published_at,
    reviewedAt: resource.resource_details.reviewed_at,
    reviewedByUserId: resource.resource_details.reviewed_by_user_id,
    childrenCount: resource.children_count ?? 0,
    url: resource.url,
  };
}
