import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export function Chip({
  children,
  icon,
  selected = false,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  selected?: boolean;
  className?: string;
}) {
  return (
    <span
      data-selected={selected || undefined}
      className={cn(
        'ui-chip inline-flex items-center gap-2 rounded-lg border border-secondary bg-secondary_subtle px-3 py-1.5 text-sm text-secondary',
        className,
      )}
    >
      {icon}
      <span
        key={typeof children === 'string' ? children : undefined}
        className="ui-token-value inline-flex min-w-0 items-center gap-1.5"
      >
        {children}
      </span>
    </span>
  );
}
