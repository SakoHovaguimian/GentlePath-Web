import type { SavedContentQuery } from './models/savedContentQuery';
import type { SavedContentType } from './models/savedContentType';
export const engagementQueryKeys = {
  all: ['gentlepath', 'engagement'] as const,
  saved: (query: Partial<SavedContentQuery>) =>
    ['gentlepath', 'engagement', 'saved', query] as const,
  savedItem: (id: string) =>
    ['gentlepath', 'engagement', 'saved-item', id] as const,
  savedState: (type: SavedContentType, id: string) =>
    ['gentlepath', 'engagement', 'saved-state', type, id] as const,
  resource: (id: string) =>
    ['gentlepath', 'engagement', 'resource', id] as const,
  blog: (id: string) => ['gentlepath', 'engagement', 'blog', id] as const,
};
