import { DirectoryPagination } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import type { MilestoneAdminPage } from '../models/milestoneAdminPage';
interface MilestonePaginationProps {
  page: MilestoneAdminPage<unknown>;
  busy: boolean;
  onNavigate: (offset: number) => void;
}
export function MilestonePagination({
  page,
  busy,
  onNavigate,
}: MilestonePaginationProps) {
  return (
    <DirectoryPagination
      count={page.data.length}
      page={page.page}
      busy={busy}
      label={copy.pagination}
      range={copy.resultRange}
      onNavigate={onNavigate}
    />
  );
}
