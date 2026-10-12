import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { UiIcon } from './UiIcon';

export function Checkbox({
  label,
  description,
  className,
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  label: ReactNode;
  description?: string;
}) {
  return (
    <label
      className={cn(
        'ui-choice-label flex min-h-11 cursor-pointer items-center gap-3 text-sm text-secondary has-[:disabled]:cursor-not-allowed has-[:disabled]:text-disabled',
        className,
      )}
    >
      <span className="ui-choice-frame relative inline-flex size-5 shrink-0">
        <input
          type="checkbox"
          className="ui-choice ui-checkbox m-0 size-5 cursor-pointer appearance-none rounded-sm border border-control-border bg-primary checked:border-brand checked:bg-brand-solid indeterminate:border-brand indeterminate:bg-brand-solid focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <UiIcon
          name="check"
          className="ui-checkbox-mark pointer-events-none absolute inset-0 size-5 p-0.5 text-(--color-text-primary_on-brand)"
        />
        <span
          aria-hidden="true"
          className="ui-checkbox-mixed pointer-events-none absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-(--color-text-primary_on-brand)"
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
