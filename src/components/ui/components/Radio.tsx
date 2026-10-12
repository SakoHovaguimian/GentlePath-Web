'use client';

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export function Radio({
  label,
  className,
  id,
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'type'> & { label: ReactNode }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'ui-choice-label flex min-h-11 cursor-pointer items-center gap-3 text-sm text-secondary has-[:disabled]:cursor-not-allowed has-[:disabled]:text-disabled',
        className,
      )}
    >
      <span className="ui-choice-frame relative inline-flex size-5 shrink-0">
        <input
          type="radio"
          id={inputId}
          className="ui-choice ui-radio absolute inset-0 m-0 size-5 cursor-pointer rounded-full border border-control-border bg-primary checked:border-brand focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 12 12"
          width="12"
          height="12"
          className="ui-radio-dot pointer-events-none absolute top-1 left-1 size-3 text-(--color-bg-brand-solid)"
        >
          <circle cx="6" cy="6" r="6" fill="currentColor" />
        </svg>
      </span>
      <span className="min-w-0 wrap-anywhere">{label}</span>
    </label>
  );
}
