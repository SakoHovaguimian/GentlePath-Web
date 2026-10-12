import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/cn';

export function Card({
  children,
  className,
  variant = 'surface',
  ...props
}: PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & { variant?: 'surface' | 'muted' | 'accent' }
>) {
  return (
    <div
      className={cn(
        'ui-card min-w-0 rounded-xl border border-secondary p-4 shadow-[var(--dashboard-shell-shadow)] sm:p-6',
        variant === 'surface' && 'bg-primary',
        variant === 'muted' && 'bg-secondary_subtle shadow-none',
        variant === 'accent' && 'ui-section-accent border-brand/20',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
