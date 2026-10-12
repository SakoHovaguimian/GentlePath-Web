'use client';

import { useLayoutEffect, useRef } from 'react';
import { motionDuration } from './motionPreferences';

// Animate ordered items between their old and new positions without delaying state.
export function useListMotion<
  T extends HTMLOListElement | HTMLUListElement = HTMLOListElement,
>(skipAnimationRef?: { current: boolean }) {
  const listRef = useRef<T>(null);
  const previous = useRef(new Map<string, DOMRect>());
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) {
      previous.current.clear();
      return;
    }
    const items = Array.from(
      list.querySelectorAll<HTMLElement>(':scope > [data-motion-key]'),
    );
    const skip = skipAnimationRef?.current;
    if (skipAnimationRef) skipAnimationRef.current = false;
    const oldKeys = Array.from(previous.current.keys());
    if (
      oldKeys.length === items.length &&
      items.every((item, index) => item.dataset.motionKey === oldKeys[index])
    )
      return;
    const next = new Map<string, DOMRect>();
    const duration = skip ? 0 : motionDuration('--motion-duration-base');
    const easing = getComputedStyle(list)
      .getPropertyValue('--motion-ease-out')
      .trim();
    for (const item of items) {
      const key = item.dataset.motionKey!;
      const animations = item.getAnimations?.() ?? [];
      const transform = getComputedStyle(item).transform;
      const matrix =
        animations.length &&
        transform !== 'none' &&
        typeof DOMMatrixReadOnly === 'function'
          ? new DOMMatrixReadOnly(transform)
          : null;
      const offsetX = matrix?.m41 ?? 0;
      const offsetY = matrix?.m42 ?? 0;
      animations.forEach((animation) => animation.cancel());
      const rect = item.getBoundingClientRect();
      const old = previous.current.get(key);
      next.set(key, rect);
      if (duration && typeof item.animate === 'function') {
        if (
          old &&
          (Math.abs(old.top + offsetY - rect.top) > 1 ||
            Math.abs(old.left + offsetX - rect.left) > 1)
        ) {
          item.animate(
            [
              {
                transform: `translate(${old.left + offsetX - rect.left}px, ${old.top + offsetY - rect.top}px)`,
              },
              { transform: 'translate(0, 0)' },
            ],
            { duration, easing },
          );
        } else if (!old && previous.current.size) {
          item.animate(
            [
              { opacity: 0, transform: 'translateY(0.375rem)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration, easing },
          );
        }
      }
    }
    previous.current = next;
  });
  return listRef;
}
