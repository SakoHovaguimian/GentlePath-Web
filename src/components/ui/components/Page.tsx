import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

// Owns the page rhythm: PageHeader, then 32px to the first content block.
export function Page({
  children,
  className,
  'aria-busy': busy,
}: {
  children: ReactNode;
  className?: string;
  'aria-busy'?: boolean;
}) {
  return (
    <div
      aria-busy={busy}
      className={cn(
        'ui-page grid w-full min-w-0 content-start gap-8',
        className,
      )}
    >
      {children}
    </div>
  );
}
