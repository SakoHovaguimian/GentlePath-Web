'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../lib/cn';

export function TextArea({
  className,
  leadingIcon,
  ...props
}: ComponentPropsWithRef<'textarea'> & { leadingIcon?: ReactNode }) {
  return (
    <div className="relative min-w-0">
      {leadingIcon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute start-4 top-3 text-tertiary"
        >
          {leadingIcon}
        </span>
      )}
      <textarea
        rows={4}
        className={cn(
          'ui-input block min-h-28 w-full resize-none rounded-lg border border-[var(--color-control-border)] bg-primary px-4 py-3 text-sm text-primary outline-none transition placeholder:text-placeholder focus:border-brand focus:ring-4 focus:ring-brand/12 aria-invalid:border-error aria-invalid:focus:ring-error/12 read-only:bg-secondary_subtle disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:text-disabled',
          leadingIcon && 'ps-11',
          className,
        )}
        {...props}
      />
    </div>
  );
}
