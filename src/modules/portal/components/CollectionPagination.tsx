import { DirectoryPagination } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';

export function collectionOffset(offset: number, total: number, limit = 9) {
  return Math.min(offset, Math.max(0, Math.floor((total - 1) / limit) * limit));
}
export function CollectionPagination({
  offset,
  total,
  limit = 9,
  onNavigate,
}: {
  offset: number;
  total: number;
  limit?: number;
  onNavigate: (offset: number) => void;
}) {
  const safeOffset = collectionOffset(offset, total, limit);
  return (
    <DirectoryPagination
      page={{
        offset: safeOffset,
        limit,
        hasMore: safeOffset + limit < total,
        nextOffset: safeOffset + limit < total ? safeOffset + limit : null,
      }}
      count={Math.min(limit, Math.max(0, total - safeOffset))}
      busy={false}
      label={copy.common.pagination}
      range={(from, to) => copy.common.range(from, to, total)}
      onNavigate={onNavigate}
    />
  );
}
