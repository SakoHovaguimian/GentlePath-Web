'use client';

import { cn } from '../lib/cn';
import type { CardOpenButtonProps } from '../models/cardOpenButtonProps';

/** A semantic stretched card action without a transform containing block. */
export function CardOpenButton({
  className,
  type = 'button',
  ...props
}: CardOpenButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        'ui-card-open cursor-pointer text-start outline-none disabled:cursor-not-allowed disabled:text-disabled',
        className,
      )}
    />
  );
}
