'use client';
import { useLayoutEffect, useRef } from 'react';
import type { ContentTransitionProps } from '../models/contentTransitionProps';
import { motionDuration } from '../lib/motionPreferences';

export function ContentTransition({
  children,
  revision,
  busy = false,
}: ContentTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    const duration = motionDuration('--motion-duration-base');
    if (!element || !duration) return;
    const animation = element.animate(
      [
        { opacity: 0.5, transform: 'translateY(0.25rem)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      {
        duration,
        easing: getComputedStyle(element)
          .getPropertyValue('--motion-ease-out')
          .trim(),
      },
    );
    return () => animation.cancel();
  }, [revision]);
  return (
    <div
      ref={ref}
      className="ui-content-transition grid min-w-0 gap-5"
      aria-busy={busy}
    >
      {children}
    </div>
  );
}
