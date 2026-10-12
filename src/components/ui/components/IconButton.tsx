import type { ComponentProps } from 'react';
import { Button } from './Button';
import { cn } from '../lib/cn';

export function IconButton({
  label,
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, 'asChild' | 'aria-label'> & {
  label: string;
}) {
  return (
    <Button
      variant="secondary"
      aria-label={label}
      title={label}
      className={cn('size-11 shrink-0 p-0', className)}
      {...props}
    />
  );
}
