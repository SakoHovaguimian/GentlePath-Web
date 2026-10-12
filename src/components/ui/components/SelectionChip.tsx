import type { ComponentPropsWithRef } from 'react';
import { Chip } from './Chip';
import { Checkbox } from './Checkbox';
import { cn } from '../lib/cn';

export function SelectionChip({
  label,
  className,
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  label: string;
}) {
  return (
    <Chip
      selected={props.checked === true}
      className={cn(
        'w-full p-0 has-[:disabled]:bg-disabled_subtle [&>.ui-token-value]:w-full',
        className,
      )}
    >
      <Checkbox {...props} label={label} className="w-full px-3 py-2" />
    </Chip>
  );
}
