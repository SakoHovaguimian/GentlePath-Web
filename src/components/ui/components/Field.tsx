'use client';

import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';

export function Field({
  labelText,
  children,
  className,
}: {
  labelText: string;
  children: ReactNode;
  className?: string;
}) {
  const generatedId = useId();
  const control = isValidElement<{ id?: string; 'aria-labelledby'?: string }>(
    children,
  )
    ? children
    : undefined;
  const id = control?.props.id ?? generatedId;
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1.5 text-sm font-medium text-secondary',
        className,
      )}
    >
      <label id={`${id}-label`} htmlFor={id}>
        {labelText}
      </label>
      {control
        ? cloneElement(
            control as ReactElement<{
              id?: string;
              'aria-labelledby'?: string;
            }>,
            {
              id,
              'aria-labelledby':
                control.props['aria-labelledby'] ?? `${id}-label`,
            },
          )
        : children}
    </div>
  );
}
