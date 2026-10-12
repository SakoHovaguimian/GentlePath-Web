import type { ComponentPropsWithRef } from 'react';
import { cn } from '../lib/cn';

export function Switch({
  label,
  description,
  className,
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'type' | 'role'> & {
  label: string;
  description?: string;
}) {
  return (
    <label
      className={cn(
        'ui-switch-label flex min-h-11 cursor-pointer items-center gap-3 text-sm text-secondary has-[:disabled]:cursor-not-allowed has-[:disabled]:text-disabled',
        className,
      )}
    >
      <span className="ui-switch-frame relative inline-flex h-6 w-11 shrink-0">
        <input
          type="checkbox"
          role="switch"
          className="ui-switch peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-full border border-control-border bg-quaternary checked:border-brand checked:bg-brand-solid focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <span
          aria-hidden="true"
          className="ui-switch-thumb pointer-events-none absolute inset-s-1 top-1 size-4 rounded-full bg-(--color-switch-thumb) shadow-xs peer-checked:translate-x-5 peer-disabled:opacity-70 rtl:peer-checked:-translate-x-5"
        />
      </span>
      <span className="min-w-0 wrap-anywhere">
        {label}
        {description && (
          <span className="mt-0.5 block text-xs text-tertiary">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
