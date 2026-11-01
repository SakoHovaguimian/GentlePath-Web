import type { Resource } from './models/resource';
import type { ResourceBrowseFilters } from './models/resourceBrowseFilters';

export function isResourceCollection(resource: Resource) {
  return resource.resourceType === 'COLLECTION';
}

export function browseResources(
  resources: Resource[],
  filters: ResourceBrowseFilters,
) {
  const search = filters.query.trim().toLocaleLowerCase('en-US');
  return resources
    .filter(
      (resource) =>
        (!filters.mode ||
          isResourceCollection(resource) ===
            (filters.mode === 'collections')) &&
        (!filters.stateCode ||
          !resource.state_codes.length ||
          resource.state_codes.includes(filters.stateCode)) &&
        (!filters.savedOnly || resource.saved) &&
        (!filters.category || resource.category === filters.category) &&
        (!filters.tag || resource.tags.includes(filters.tag)) &&
        `${resource.title} ${resource.description} ${resource.tags.join(' ')}`
          .toLocaleLowerCase('en-US')
          .includes(search),
    )
    .sort((left, right) => {
      const title = left.title.localeCompare(right.title, 'en-US');
      switch (filters.sort) {
        case 'title-desc':
          return -title || left.id.localeCompare(right.id);
        case 'newest':
          return (
            (Date.parse(right.createdAt ?? '') || 0) -
              (Date.parse(left.createdAt ?? '') || 0) || title
          );
        case 'rating':
          return (
            (right.ratings.average ?? 0) - (left.ratings.average ?? 0) ||
            right.ratings.count - left.ratings.count ||
            title
          );
        case 'shortest':
          return left.readMinutes - right.readMinutes || title;
        default:
          return title || left.id.localeCompare(right.id);
      }
    });
}
