import type { ReactNode } from 'react';
import { strings } from '@/strings';
import { cn } from '../lib/cn';

export function FormActions({
  children,
  description,
  sticky = true,
  live = false,
  variant = 'panel',
}: {
  children: ReactNode;
  description?: string;
  sticky?: boolean;
  // Announces description changes, e.g. saving and saved notices.
  live?: boolean;
  variant?: 'panel' | 'inline' | 'plain';
}) {
  return (
    <div
      role="group"
      aria-label={strings.pageLayout.formActions}
      className={cn(
        'ui-form-actions flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-3',
        variant === 'inline' && 'border-t border-secondary pt-4',
        variant === 'panel' && [
          'rounded-xl border border-secondary bg-primary px-4 py-3 sm:px-5',
          sticky
            ? 'ui-form-actions-sticky shadow-(--dashboard-shell-shadow-lg)'
            : 'shadow-(--dashboard-shell-shadow)',
        ],
      )}
    >
      {(description || live) && (
        <p
          role={live ? 'status' : undefined}
          aria-live={live ? 'polite' : undefined}
          className="m-0 min-w-0 flex-1 basis-64 text-sm text-secondary"
        >
          {description}
        </p>
      )}
      <div className="flex w-full flex-wrap gap-3 sm:ms-auto sm:w-auto sm:justify-end">
        {children}
      </div>
    </div>
  );
}
