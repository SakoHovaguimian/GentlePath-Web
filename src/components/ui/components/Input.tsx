'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../lib/cn';
export { Field } from './Field';

type InputProps = ComponentPropsWithRef<'input'> & {
  leadingIcon?: ReactNode;
};

export function Input({
  id,
  type,
  className,
  leadingIcon,
  ...props
}: InputProps) {
  return (
    <div className="group relative">
      {leadingIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-tertiary transition-colors group-hover:text-secondary group-focus-within:text-brand-secondary">
          {leadingIcon}
        </span>
      ) : null}
      <input
        id={id}
        type={type}
        className={cn(
          'ui-input min-h-12 w-full min-w-0 rounded-lg border border-control-border bg-primary px-4 py-2.5 text-sm text-primary shadow-none outline-none transition placeholder:text-placeholder hover:border-primary focus:border-brand focus:ring-4 focus:ring-brand/12 aria-invalid:border-error aria-invalid:focus:ring-error/12 read-only:bg-secondary_subtle disabled:cursor-not-allowed disabled:border-secondary disabled:bg-disabled_subtle disabled:text-disabled',
          leadingIcon ? 'pl-11' : null,
          type === 'date' || type === 'time'
            ? 'scheme-light dark:scheme-dark'
            : null,
          className,
        )}
        {...props}
      />
    </div>
  );
}
