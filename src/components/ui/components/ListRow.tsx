import type { ReactNode, Ref } from 'react';
import { cn } from '../lib/cn';

// A divided list surface. Children are ListRow elements wrapped in <li>.
export function ListGroup({
  children,
  ordered = false,
  label,
  listRef,
  className,
}: {
  children: ReactNode;
  ordered?: boolean;
  label?: string;
  listRef?: Ref<HTMLOListElement>;
  className?: string;
}) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <List
      ref={listRef as Ref<HTMLOListElement & HTMLUListElement>}
      aria-label={label}
      className={cn(
        'ui-list-group m-0 grid min-w-0 list-none divide-y divide-secondary overflow-hidden rounded-xl border border-secondary bg-primary p-0',
        className,
      )}
    >
      {children}
    </List>
  );
}

// Leading visual, title/description, and trailing status or actions.
// Trailing content drops below the text on narrow screens.
export function ListRow({
  leading,
  title,
  description,
  trailing,
  className,
}: {
  leading?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'ui-list-row grid min-w-0 items-center gap-x-4 gap-y-2 px-4 py-3.5',
        leading
          ? 'grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto]'
          : 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto]',
        className,
      )}
    >
      {leading}
      <div className="grid min-w-0 gap-0.5">
        <div className="text-sm font-semibold text-primary wrap-anywhere">
          {title}
        </div>
        {description && (
          <div className="text-sm text-secondary wrap-anywhere">
            {description}
          </div>
        )}
      </div>
      {trailing && (
        <div
          className={cn(
            'flex min-w-0 flex-wrap items-center gap-2 sm:col-start-auto sm:justify-end',
            leading && 'col-start-2',
          )}
        >
          {trailing}
        </div>
      )}
    </div>
  );
}
