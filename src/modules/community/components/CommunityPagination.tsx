import { useEffect } from 'react';
import { DirectoryPagination } from '@/components/ui';
import type { DirectoryPage } from '@/components/ui/models/directoryPage';
import { gentlePathCommunityStrings as copy } from '@/strings';

interface CommunityPaginationProps {
  page: DirectoryPage;
  count: number;
  busy: boolean;
  label?: string;
  onNavigate: (offset: number) => void;
}
export function CommunityPagination({
  page,
  count,
  busy,
  label = copy.pagination,
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
      label={label}
      range={copy.range}
      onNavigate={onNavigate}
    />
  );
}
