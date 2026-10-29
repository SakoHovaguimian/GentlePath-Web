import { useEffect } from 'react';
import { DirectoryPagination, type DirectoryPage } from '@/components/ui';
import { gentlePathAccountToolsStrings as copy } from '@/strings';

export function AccountToolsPagination({
  page,
  count,
  busy,
  onNavigate,
}: {
  page: DirectoryPage;
  count: number;
  busy: boolean;
  onNavigate: (offset: number) => void;
}) {
  useEffect(() => {
    if (!busy && count === 0 && page.offset > 0) onNavigate(0);
  }, [busy, count, page.offset, onNavigate]);
  return (
    <DirectoryPagination
      page={page}
      count={count}
      busy={busy}
      label={copy.common.paginationLabel}
      range={copy.common.rangeLabel}
      onNavigate={onNavigate}
    />
  );
}
