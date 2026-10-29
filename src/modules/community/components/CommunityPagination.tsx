import { useEffect } from 'react';
import { DirectoryPagination } from '@/components/ui';
import type { DirectoryPage } from '@/components/ui/models/directoryPage';
import { gentlePathCommunityStrings as copy } from '@/strings';

interface CommunityPaginationProps {
  page: DirectoryPage;
  count: number;
  busy: boolean;
  onNavigate: (offset: number) => void;
}
export function CommunityPagination({
  page,
  count,
  busy,
  onNavigate,
}: CommunityPaginationProps) {
  useEffect(() => {
    if (!busy && count === 0 && page.offset > 0) onNavigate(0);
  }, [busy, count, page.offset, onNavigate]);
  return (
    <DirectoryPagination
      page={page}
      count={count}
      busy={busy}
      label={copy.pagination}
      range={copy.range}
      onNavigate={onNavigate}
    />
  );
}
