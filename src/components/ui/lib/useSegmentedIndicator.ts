'use client';

import { useLayoutEffect, useRef } from 'react';

export function useSegmentedIndicator(value: string) {
  const groupRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const group = groupRef.current;
    const indicator = indicatorRef.current;
    if (!group || !indicator) return;
    function update() {
      if (!group || !indicator) return;
      const selected = group
        .querySelector<HTMLInputElement>('input:checked')
        ?.closest('label');
      if (!selected) {
        indicator.style.opacity = '0';
        return;
      }
      indicator.style.setProperty(
        '--ui-segment-x',
        `${selected.offsetLeft + 4}px`,
      );
      indicator.style.setProperty(
        '--ui-segment-y',
        `${selected.offsetTop + 6}px`,
      );
      indicator.style.setProperty(
        '--ui-segment-width',
        `${selected.offsetWidth - 8}px`,
      );
      indicator.style.setProperty(
        '--ui-segment-height',
        `${selected.offsetHeight - 12}px`,
      );
      indicator.style.opacity = '1';
    }
    update();
    // Place the first indicator before enabling movement, including hydration.
    const readyFrame = requestAnimationFrame(() => {
      group.dataset.ready = 'true';
    });
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => {
        cancelAnimationFrame(readyFrame);
        window.removeEventListener('resize', update);
      };
    }
    const observer = new ResizeObserver(update);
    observer.observe(group);
    group.querySelectorAll('label').forEach((label) => observer.observe(label));
    return () => {
      cancelAnimationFrame(readyFrame);
      observer.disconnect();
    };
  }, [value]);

  return { groupRef, indicatorRef };
}
