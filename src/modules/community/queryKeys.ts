import type { CommunityCommentQuery } from './models/communityCommentQuery';
import type { CommunityPostQuery } from './models/communityPostQuery';
import type { CommunityReportQuery } from './models/communityReportQuery';

export const communityQueryKeys = {
  all: ['gentlepath', 'community'] as const,
  status: ['gentlepath', 'community', 'status'] as const,
  posts: (query: CommunityPostQuery) =>
    ['gentlepath', 'community', 'posts', query] as const,
  post: (id: string) => ['gentlepath', 'community', 'post', id] as const,
  comments: (id: string, paging: CommunityCommentQuery) =>
    ['gentlepath', 'community', 'comments', id, paging] as const,
  reports: (query: CommunityReportQuery) =>
    ['gentlepath', 'community', 'reports', query] as const,
};
