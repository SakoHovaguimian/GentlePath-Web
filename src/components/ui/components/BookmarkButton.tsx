'use client';

import { gentlePathEngagementStrings as copy } from '@/strings';
import { cn } from '../lib/cn';
import type { BookmarkButtonProps } from '../models/bookmarkButtonProps';
import { Button } from './Button';
import { SuccessCelebration } from './SuccessCelebration';
import { UiIcon } from './UiIcon';

export function BookmarkButton({
  saved = false,
  children,
  className,
  loading = false,
  ...props
}: BookmarkButtonProps) {
  return (
    <span className="relative inline-flex w-fit max-w-full min-w-0">
      <SuccessCelebration active={saved} ready={!loading} />
      <Button
        {...props}
        loading={loading}
        className={cn('gap-1.5', className)}
        aria-pressed={
          props['aria-pressed'] ?? (props.type === 'submit' ? undefined : saved)
        }
      >
        <UiIcon
          name="bookmark"
          fill={saved ? 'currentColor' : 'none'}
          className="size-4"
        />
        {saved ? copy.saved : (children ?? copy.save)}
      </Button>
    </span>
  );
}
