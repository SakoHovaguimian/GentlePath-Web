import type { EditorialQuery } from './models/editorialQuery';

export const editorialQueryKeys = {
  all: ['gentlepath', 'editorial'] as const,
  guides: (query: EditorialQuery) =>
    ['gentlepath', 'editorial', 'guides', query] as const,
  guide: (id?: string) => ['gentlepath', 'editorial', 'guide', id] as const,
  resources: (query: EditorialQuery) =>
    ['gentlepath', 'editorial', 'resources', query] as const,
  resource: (id?: string) =>
    ['gentlepath', 'editorial', 'resource', id] as const,
  collections: ['gentlepath', 'editorial', 'collections'] as const,
};
