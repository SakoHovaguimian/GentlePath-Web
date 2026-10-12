'use client';

import type { ComponentPropsWithRef } from 'react';
import { cn } from '../lib/cn';
import { UiIcon } from './UiIcon';

export function DialogSelectField({
  children,
  className,
  type,
  ...props
}: ComponentPropsWithRef<'button'>) {
  return (
    <button
      {...props}
      type={type ?? 'button'}
      aria-haspopup="dialog"
      className={cn(
        'ui-select-trigger ui-input flex min-h-12 w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-control-border bg-primary px-4 py-2.5 text-left text-sm text-primary outline-none hover:border-primary focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/12 aria-invalid:border-error disabled:cursor-not-allowed disabled:border-secondary disabled:bg-disabled_subtle disabled:text-disabled',
        className,
      )}
    >
      <span className="min-w-0 flex-1 wrap-anywhere">{children}</span>
      <UiIcon name="chevronDown" className="size-4 text-tertiary" />
    </button>
  );
}
