import type { ComponentPropsWithRef } from 'react';
import { cn } from '../lib/cn';

export function FileInput({
  className,
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'type'>) {
  return <input type="file" className={cn('sr-only', className)} {...props} />;
}
