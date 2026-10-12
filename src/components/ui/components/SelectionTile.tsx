import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Checkbox } from './Checkbox';

export function SelectionTile({
  label,
  icon,
  description,
  className,
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  label: string;
  icon?: ReactNode;
  description?: string;
}) {
  return (
    <Checkbox
      {...props}
      description={description}
      className={cn(
        'ui-selection-tile min-h-12 rounded-lg border border-secondary bg-primary px-3 py-2 hover:border-brand/50 has-[:checked]:border-brand/30 has-[:checked]:bg-brand-primary has-[:disabled]:bg-disabled_subtle has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
        className,
      )}
      label={
        <span className="flex items-center gap-3">
          {icon && (
            <span
              aria-hidden="true"
              className={
                props.disabled
                  ? 'ui-tile-icon text-disabled'
                  : 'ui-tile-icon text-brand-secondary'
              }
            >
              {icon}
            </span>
          )}
          <span>{label}</span>
        </span>
      }
    />
  );
}
