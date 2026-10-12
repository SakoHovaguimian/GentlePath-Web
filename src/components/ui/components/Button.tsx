'use client';

import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithRef, PropsWithChildren } from 'react';
import { buttonClassName } from '../lib/buttonStyles';
import type { ButtonVariant } from '../models/buttonVariant';
import { Spinner } from './Spinner';

type ButtonProps = PropsWithChildren<
  ComponentPropsWithRef<'button'> & {
    variant?: ButtonVariant;
    asChild?: boolean;
    loading?: boolean;
  }
>;

export function Button({
  children,
  variant = 'primary',
  asChild = false,
  className,
  type,
  loading = false,
  disabled,
  onClickCapture,
  tabIndex,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={buttonClassName(variant, className)}
      {...(!asChild ? { type: type ?? 'button' } : {})}
      {...(!asChild ? { disabled: disabled || loading } : {})}
      data-variant={variant}
      aria-disabled={asChild && (disabled || loading) ? true : undefined}
      tabIndex={asChild && (disabled || loading) ? -1 : tabIndex}
      onClickCapture={(event) => {
        if (asChild && (disabled || loading)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClickCapture?.(event);
      }}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? (
            <>
              <span
                aria-hidden="true"
                className="invisible inline-flex items-center gap-2"
              >
                {children}
              </span>
              <span className="sr-only">{children}</span>
              <span className="absolute inset-0 grid place-items-center">
                <Spinner />
              </span>
            </>
          ) : (
            children
          )}
        </>
      )}
    </Comp>
  );
}
