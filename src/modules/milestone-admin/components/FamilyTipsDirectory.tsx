import type { ReactNode } from 'react';
import { DataPanel } from '@/components/ui';

export function FamilyTipsDirectory({
  staff,
  busy,
  busyLabel,
  toolbar,
  footer,
  children,
}: {
  staff: boolean;
  busy: boolean;
  busyLabel: string;
  toolbar: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  if (staff)
    return (
      <DataPanel
        busy={busy}
        busyLabel={busyLabel}
        toolbar={toolbar}
        footer={footer}
      >
        {children}
      </DataPanel>
    );

  return (
    <div aria-busy={busy} className="relative grid min-w-0 gap-5">
      <span
        aria-hidden="true"
        data-active={busy || undefined}
        className="ui-progress-line"
      />
      <span role="status" aria-live="polite" className="sr-only">
        {busy ? busyLabel : ''}
      </span>
      {toolbar}
      {children}
      {footer}
    </div>
  );
}
