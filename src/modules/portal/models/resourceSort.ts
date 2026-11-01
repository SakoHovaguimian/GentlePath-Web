export const resourceSortOptions = [
  'title',
  'title-desc',
  'newest',
  'rating',
  'shortest',
] as const;

export type ResourceSort = (typeof resourceSortOptions)[number];
