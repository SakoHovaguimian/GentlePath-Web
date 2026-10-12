import type { ComponentPropsWithRef } from 'react';
import { cn } from '../lib/cn';
import { Checkbox } from './Checkbox';

// A prominent name or detail check before reviewing a consequential action.
export function ConfirmationChoice({
  label,
  description,
  className,
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  label: string;
  description: string;
}) {
  return (
    <Checkbox
      {...props}
      className={cn(
        'rounded-lg border border-brand/30 bg-brand-primary px-5 py-4 hover:border-brand has-[:checked]:border-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
        className,
      )}
      label={
        <span className="grid min-w-0 gap-1.5">
          <span className="text-base font-semibold text-primary">{label}</span>
          <span className="text-sm text-secondary">{description}</span>
        </span>
      }
    />
  );
}
