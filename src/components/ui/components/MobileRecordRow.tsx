import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

// Compact record summaries keep facts below the identity and status at the end.
export function MobileRecordRow({
  title,
  leading,
  description,
  children,
  footer,
  summary,
  className,
}: {
  title: ReactNode;
  leading?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  summary?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid min-w-0 gap-4 p-4', className)}>
      <div className="grid min-w-0 gap-1">
        <div className="flex min-w-0 items-center gap-3">
          {leading && <div className="shrink-0">{leading}</div>}
          <div className="min-w-0 flex-1 text-sm font-semibold text-primary wrap-anywhere">
            {title}
          </div>
        </div>
        {description && (
          <div className="text-xs font-normal text-tertiary wrap-anywhere">
            {description}
          </div>
        )}
      </div>
      {summary}
      {children}
      {footer && (
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          {footer}
        </div>
      )}
    </div>
  );
}
