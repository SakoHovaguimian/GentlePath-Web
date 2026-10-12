import type { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '../lib/cn';

// One surface for a directory: filters, records, and paging share its edges.
// Background refreshes show a thin progress line and announce busyLabel.
export function DataPanel({
  toolbar,
  footer,
  busy = false,
  busyLabel,
  children,
  className,
}: {
  toolbar?: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
  busyLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      aria-busy={busy}
      className={cn(
        'ui-data-panel relative grid min-w-0 overflow-hidden p-0 sm:p-0',
        className,
      )}
    >
      <span
        aria-hidden="true"
        data-active={busy || undefined}
        className="ui-progress-line"
      />
      <span role="status" aria-live="polite" className="sr-only">
        {busy ? busyLabel : ''}
      </span>
      {toolbar && (
        <div className="min-w-0 border-b border-secondary p-4 sm:px-6">
          {toolbar}
        </div>
      )}
      <div className="min-w-0">{children}</div>
      {footer && (
        <div className="min-w-0 border-t border-secondary px-4 py-3 sm:px-6">
          {footer}
        </div>
      )}
    </Card>
  );
}

// Centers loading or error feedback inside a DataPanel body.
export function DataPanelState({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-64 place-items-center p-4 sm:p-6">
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}
