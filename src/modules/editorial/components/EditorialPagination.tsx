import { DirectoryPagination } from '@/components/ui';
import type { DirectoryPage } from '@/components/ui/models/directoryPage';
import { gentlePathEditorialStrings as copy } from '@/strings';

interface Props {
  page: DirectoryPage;
  count: number;
  busy: boolean;
  onNavigateAction: (offset: number) => void;
}
export function EditorialPagination({
  page,
  count,
  busy,
  onNavigateAction,
}: Props) {
  return (
    <DirectoryPagination
      page={page}
      count={count}
      busy={busy}
      label={copy.pagination}
      range={copy.range}
      onNavigate={onNavigateAction}
    />
  );
}
