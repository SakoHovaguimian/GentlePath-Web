'use client';

import { DirectoryPagination } from '@/components/ui';
import { gentlePathBlogStrings as copy } from '@/strings';
import type { BlogPage } from '../models/blogPage';

export function BlogPagination({
  page,
  busy = false,
  onNavigateAction,
}: {
  page: BlogPage;
  busy?: boolean;
  onNavigateAction: (offset: number) => void;
}) {
  const hasMore = page.offset + page.data.length < page.total;
  return (
    <DirectoryPagination
      count={page.data.length}
      busy={busy}
      label={copy.paginationLabel}
      page={{
        limit: page.limit,
        offset: page.offset,
        hasMore,
        nextOffset: hasMore ? page.offset + page.limit : null,
      }}
      range={(from, to) => copy.articleRange(from, to, page.total)}
      onNavigate={onNavigateAction}
    />
  );
}
