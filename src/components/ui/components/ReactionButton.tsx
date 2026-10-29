'use client';

import { useLayoutEffect, useRef } from 'react';
import { cn } from '../lib/cn';
import { motionDuration } from '../lib/motionPreferences';
import type { ReactionButtonProps } from '../models/reactionButtonProps';
import { Button } from './Button';
import { UiIcon } from './UiIcon';

export function ReactionButton({
  liked,
  label,
  count,
  countLabel,
  loading = false,
  className,
  ...props
}: ReactionButtonProps) {
  const heartRef = useRef<HTMLSpanElement>(null);
  const previousLiked = useRef<boolean | undefined>(
    loading ? undefined : liked,
  );

  useLayoutEffect(() => {
    if (loading) return;
    const previous = previousLiked.current;
    previousLiked.current = liked;
    if (previous !== false || !liked) return;
    const heart = heartRef.current;
    const duration = motionDuration('--motion-duration-base');
    if (!duration || !heart || typeof heart.animate !== 'function') return;
    const animation = heart.animate(
      [
        { transform: 'scale(0.82)' },
        { transform: 'scale(1.24)', offset: 0.45 },
        { transform: 'scale(1)' },
      ],
      {
        duration,
        easing: getComputedStyle(heart)
          .getPropertyValue('--motion-ease-out')
          .trim(),
      },
    );
    return () => animation.cancel();
  }, [liked, loading]);

  return (
    <Button
      {...props}
      variant={liked ? 'destructive' : 'ghost'}
      className={cn('ui-reaction-button justify-self-start', className)}
      loading={loading}
      aria-pressed={liked}
    >
      <span ref={heartRef} aria-hidden="true" className="inline-flex">
        <UiIcon name="heart" fill={liked ? 'currentColor' : 'none'} />
      </span>
      {label}
      {count !== undefined && (
        <span
          aria-hidden={countLabel ? true : undefined}
          className="text-xs tabular-nums"
        >
          {count.toLocaleString('en-US')}
        </span>
      )}
      {countLabel && <span className="sr-only">{countLabel}</span>}
    </Button>
  );
}
