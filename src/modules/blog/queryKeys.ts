import type { BlogQuery } from './models/blogQuery';

export const blogQueryKeys = {
  all: ['gentlepath', 'blog'] as const,
  options: ['gentlepath', 'blog', 'options'] as const,
  list: (query: BlogQuery) => ['gentlepath', 'blog', 'list', query] as const,
  detail: (id?: string) => ['gentlepath', 'blog', 'detail', id] as const,
};
