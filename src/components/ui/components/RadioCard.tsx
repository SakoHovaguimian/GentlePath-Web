import type { ComponentProps, ReactNode } from 'react';
import { Radio } from './Radio';
import { IconTile } from './IconTile';
import { cn } from '../lib/cn';

export function RadioCard({
  label,
  description,
  icon,
  className,
  ...props
}: Omit<ComponentProps<typeof Radio>, 'label'> & {
  label: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Radio
      {...props}
      className={cn(
        'ui-selection-tile h-full items-start rounded-xl border border-secondary bg-primary p-5 hover:border-brand/50 hover:bg-primary_hover has-checked:border-brand has-checked:bg-brand-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 [&>.ui-choice-frame]:mt-3',
        className,
      )}
      label={
        <span className="grid min-w-0 gap-4">
          <IconTile>{icon}</IconTile>
          <span className="grid gap-2">
            <span className="text-base font-semibold text-primary">
              {label}
            </span>
            <span className="text-sm font-normal text-secondary">
              {description}
            </span>
          </span>
        </span>
      }
    />
  );
}
