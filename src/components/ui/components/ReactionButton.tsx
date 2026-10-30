'use client';

import { useLayoutEffect, useRef } from 'react';
import { cn } from '../lib/cn';
import { motionDuration } from '../lib/motionPreferences';
import type { ReactionButtonProps } from '../models/reactionButtonProps';
import { Button } from './Button';
import { UiIcon } from './UiIcon';

const particles = Array.from({ length: 14 }, (_, index) => index);

export function ReactionButton({
  liked,
  label,
  count,
  countLabel,
  loading = false,
  disabled,
  className,
  ...props
}: ReactionButtonProps) {
  const heartRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const previousLiked = useRef<boolean | undefined>(
    loading ? undefined : liked,
  );

  useLayoutEffect(() => {
    if (loading) return;
    const previous = previousLiked.current;
    previousLiked.current = liked;
    if (previous === undefined || previous === liked) return;
    const heart = heartRef.current;
    const duration = motionDuration('--motion-duration-celebration');
    if (!duration || !heart || typeof heart.animate !== 'function') return;
    const easing = getComputedStyle(heart)
      .getPropertyValue('--motion-ease-out')
      .trim();
    const animations: Animation[] = [];
    const icon = heart.querySelector('svg');
    if (icon)
      animations.push(
        icon.animate(
          liked
            ? [
                { transform: 'scale(1) rotate(0deg)' },
                { transform: 'scale(0.7) rotate(-12deg)', offset: 0.15 },
                { transform: 'scale(1.3) rotate(7deg)', offset: 0.42 },
                { transform: 'scale(0.96) rotate(-3deg)', offset: 0.72 },
                { transform: 'scale(1) rotate(0deg)' },
              ]
            : [
                { transform: 'scale(1)' },
                { transform: 'scale(0.85)', offset: 0.4 },
                { transform: 'scale(1)' },
              ],
          { duration, easing },
        ),
      );
    if (liked) {
      const ring = heart.querySelector('[data-reaction-ring]');
      if (ring)
        animations.push(
          ring.animate(
            [
              { transform: 'scale(0.4)', opacity: 0.6 },
              { transform: 'scale(1.8)', opacity: 0 },
            ],
            { duration, easing },
          ),
        );
      heart
        .querySelectorAll('[data-reaction-particle]')
        .forEach((particle, index) => {
          const angle = (index / particles.length) * Math.PI * 2;
          const distance = 36 + (index % 3) * 12;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          animations.push(
            particle.animate(
              [
                { transform: 'translate(0, 0) scale(0)', opacity: 0 },
                {
                  transform: `translate(${x * 0.55}px, ${y * 0.55}px) scale(1)`,
                  opacity: 0.85,
                  offset: 0.35,
                },
                {
                  transform: `translate(${x}px, ${y + 12}px) scale(0.3) rotate(${index * 37}deg)`,
                  opacity: 0,
                },
              ],
              { duration, easing },
            ),
          );
        });
    }
    if (countRef.current)
      animations.push(
        countRef.current.animate(
          [
            {
              transform: `translateY(${liked ? '35%' : '-35%'})`,
              opacity: 0.25,
            },
            { transform: 'translateY(0)', opacity: 1 },
          ],
          {
            duration: motionDuration('--motion-duration-base'),
            easing,
          },
        ),
      );
    return () => animations.forEach((animation) => animation.cancel());
  }, [liked, loading]);

  return (
    <Button
      {...props}
      variant={liked ? 'destructive' : 'ghost'}
      className={cn('ui-reaction-button justify-self-start', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-pressed={liked}
    >
      <span
        ref={heartRef}
        aria-hidden="true"
        className="pointer-events-none relative inline-flex shrink-0"
      >
        <UiIcon
          name="heart"
          fill={liked ? 'currentColor' : 'none'}
          className="relative z-1"
        />
        <span
          data-reaction-ring
          className="absolute inset-0 rounded-full border border-current opacity-0"
        />
        {particles.map((particle) => (
          <span
            key={particle}
            data-reaction-particle
            className={cn(
              'absolute top-1/2 left-1/2 -mt-0.5 -ml-0.5 bg-current opacity-0',
              particle % 2 ? 'h-1.5 w-1 rounded-xs' : 'size-1.5 rounded-full',
            )}
          />
        ))}
      </span>
      {label}
      {count !== undefined && (
        <span
          ref={countRef}
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
