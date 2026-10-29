import type { HTMLAttributes, ReactNode } from 'react';
import type { UiIntent } from '../models/uiIntent';
import { cn } from '../lib/cn';

const tones = {
  neutral: 'bg-utility-gray-50 text-utility-gray-700 ring-utility-gray-200',
  brand: 'bg-brand-primary text-brand-secondary ring-brand/20',
  info: 'bg-utility-blue-50 text-utility-blue-700 ring-utility-blue-200',
  success:
    'bg-utility-success-50 text-utility-success-700 ring-utility-success-200',
  warning:
    'bg-utility-warning-50 text-utility-warning-700 ring-utility-warning-200',
  danger: 'bg-utility-error-50 text-utility-error-700 ring-utility-error-200',
  pink: 'bg-utility-pink-50 text-utility-pink-700 ring-utility-pink-200',
  purple:
    'bg-utility-purple-50 text-utility-purple-700 ring-utility-purple-200',
};

export function Badge({
  children,
  intent = 'neutral',
  dot = false,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  intent?: UiIntent | 'brand' | 'pink' | 'purple';
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'ui-badge inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        tones[intent],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      )}
      <span
        key={typeof children === 'string' ? children : undefined}
        className="ui-token-value inline-flex min-w-0 items-center gap-1.5"
      >
        {children}
      </span>
    </span>
  );
}
