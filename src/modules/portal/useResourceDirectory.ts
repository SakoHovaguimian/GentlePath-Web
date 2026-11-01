'use client';

import { useSearchParams } from 'next/navigation';
import { ResourceCategorySchema } from './models/resource';
import { resourceSortOptions, type ResourceSort } from './models/resourceSort';
import { usePortalDirectory } from './usePortalDirectory';

export function useResourceDirectory() {
  const directory = usePortalDirectory();
  const params = useSearchParams();
  const rawSort = params.get('sort');
  const sort = resourceSortOptions.includes(rawSort as ResourceSort)
    ? (rawSort as ResourceSort)
    : 'title';
  const category = ResourceCategorySchema.safeParse(directory.status);
  return {
    ...directory,
    category: category.success ? category.data : '',
    tag: params.get('tag') ?? '',
    sort,
    mode:
      params.get('mode') === 'collections'
        ? ('collections' as const)
        : ('resources' as const),
    clear: () =>
      directory.update({
        query: undefined,
        status: undefined,
        tag: undefined,
        offset: undefined,
      }),
  };
}
