'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { cn } from '../lib/cn';
import { motionDuration } from '../lib/motionPreferences';
import { playOnboardingFireworks } from '../lib/onboardingFireworks';
import type { SuccessCelebrationProps } from '../models/successCelebrationProps';
import styles from './SuccessCelebration.module.css';

const particles = Array.from({ length: 20 }, (_, index) => index);

export function SuccessCelebration({
  sequence = 0,
  active,
  ready = true,
  variant = 'burst',
  onComplete,
  className,
}: SuccessCelebrationProps) {
  const surface = useRef<HTMLSpanElement>(null);
  const previous = useRef(sequence);
  const previousActive = useRef(ready ? active : undefined);

  useLayoutEffect(() => {
    if (!ready) return;
    const changed =
      (sequence > 0 && previous.current !== sequence) ||
      (previousActive.current === false && active === true);
    previous.current = sequence;
    previousActive.current = active;
    const duration = motionDuration(
      variant === 'onboarding'
        ? '--motion-duration-onboarding-celebration'
        : '--motion-duration-celebration',
    );
    if (!changed || !surface.current) return;
    if (!duration) {
      if (variant === 'onboarding') onComplete?.();
      return;
    }
    if (variant === 'onboarding') {
      if (active === false) return;
      const canvas = surface.current.querySelector('canvas');
      if (canvas) return playOnboardingFireworks(canvas, duration, onComplete);
      return;
    }
    const easing = getComputedStyle(surface.current)
      .getPropertyValue('--motion-ease-out')
      .trim();
    const animations = Array.from(surface.current.children).map(
      (particle, index) => {
        const angle = (index / particles.length) * Math.PI * 2;
        const distance = 52 + (index % 4) * 15;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 18;
        return particle.animate(
          [
            {
              opacity: 0,
              transform: 'translate(0, 0) scale(0.2) rotate(0deg)',
            },
            {
              opacity: 1,
              transform: `translate(${x * 0.5}px, ${y * 0.6}px) scale(1.1) rotate(${index * 17}deg)`,
              offset: 0.25,
            },
            {
              opacity: 0,
              transform: `translate(${x}px, ${y + 32}px) scale(0.5) rotate(${index * 39}deg)`,
            },
          ],
          {
            duration: duration * 1.6,
            easing,
            delay: (index % 3) * (duration / 24),
          },
        );
      },
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, [active, ready, sequence, variant, onComplete]);

  return (
    <span
      ref={surface}
      aria-hidden="true"
      className={cn(
        styles.celebration,
        variant === 'onboarding' && styles.onboarding,
        className,
      )}
    >
      {variant === 'onboarding' ? (
        <canvas className={styles.canvas} data-celebration-state="idle" />
      ) : (
        particles.map((index) => (
          <i
            key={index}
            className={styles.particle}
            style={{ '--particle-index': index } as CSSProperties}
          />
        ))
      )}
    </span>
  );
}
