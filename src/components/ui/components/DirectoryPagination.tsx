import type { DirectoryPage } from '../models/directoryPage';
import { strings } from '@/strings';
import { Button } from './Button';
import { UiIcon } from './UiIcon';

export function DirectoryPagination({
  page,
  count,
  busy,
  label,
  range,
  onNavigate,
}: {
  page: DirectoryPage;
  count: number;
  busy: boolean;
  label: string;
  range: (from: number, to: number) => string;
  onNavigate: (offset: number) => void;
}) {
  const single = page.offset === 0 && !page.hasMore;
  return (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-3">
      <p
        className="m-0 text-sm text-tertiary tabular-nums"
        role="status"
        aria-live="polite"
      >
        {count > 0 && range(page.offset + 1, page.offset + count)}
      </p>
      {!single && (
        <nav aria-label={label} className="flex flex-wrap gap-2">
          {page.offset > 0 && count === 0 && (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => onNavigate(0)}
            >
              {strings.directory.firstPage}
            </Button>
          )}
          <Button
            variant="secondary"
            className="ps-3"
            disabled={busy || page.offset === 0}
            onClick={() => onNavigate(Math.max(0, page.offset - page.limit))}
          >
            <UiIcon name="chevronLeft" className="size-4" />
            {strings.directory.previousPage}
          </Button>
          <Button
            variant="secondary"
            className="pe-3"
            disabled={busy || !page.hasMore || page.nextOffset === null}
            onClick={() => onNavigate(page.nextOffset ?? 0)}
          >
            {strings.directory.nextPage}
            <UiIcon name="chevronRight" className="size-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
