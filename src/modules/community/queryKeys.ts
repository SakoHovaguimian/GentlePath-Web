import type { CommunityPaging } from './models/communityPaging';
import type { CommunityPostQuery } from './models/communityPostQuery';
import type { CommunityReportQuery } from './models/communityReportQuery';

export const communityQueryKeys = {
  all: ['gentlepath', 'community'] as const,
  status: ['gentlepath', 'community', 'status'] as const,
  posts: (query: CommunityPostQuery) =>
    ['gentlepath', 'community', 'posts', query] as const,
  post: (id: string) => ['gentlepath', 'community', 'post', id] as const,
  comments: (id: string, paging: CommunityPaging) =>
    ['gentlepath', 'community', 'comments', id, paging] as const,
  reports: (query: CommunityReportQuery) =>
    ['gentlepath', 'community', 'reports', query] as const,
};
