import type { PollPaging, PollQuery } from './models/pollQuery';

export const pollQueryKeys = {
  all: ['polls'] as const,
  status: ['polls', 'status'] as const,
  list: (query: PollQuery) => ['polls', 'list', query] as const,
  detail: (id: string) => ['polls', 'detail', id] as const,
  ballot: (id: string) => ['polls', 'ballot', id] as const,
  comments: (id: string, paging: PollPaging) =>
    ['polls', 'comments', id, paging] as const,
};
