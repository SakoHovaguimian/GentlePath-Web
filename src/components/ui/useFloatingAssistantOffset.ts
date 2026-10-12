'use client';

import { useLayoutEffect, useRef } from 'react';

// Follow the actual footer geometry, including wrapped actions on small screens.
export function useFloatingAssistantOffset(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const observed = new Set<Element>();
    const resize = new ResizeObserver(schedule);
    function measure() {
      frame = 0;
      const viewportHeight = window.innerHeight;
      let clearance = 0;
      document.querySelectorAll('.ui-form-actions-sticky').forEach((footer) => {
        if (!observed.has(footer)) {
          observed.add(footer);
          resize.observe(footer);
        }
        const bounds = footer.getBoundingClientRect();
        if (
          bounds.height > 0 &&
          bounds.top > viewportHeight / 2 &&
          bounds.top < viewportHeight &&
          bounds.bottom > 0
        ) {
          clearance = Math.max(clearance, viewportHeight - bounds.top + 12);
        }
      });
      ref.current?.style.setProperty(
        '--ui-assistant-footer-clearance',
        `${clearance}px`,
      );
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('scroll', schedule, true);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
      window.removeEventListener('resize', schedule);
      document.removeEventListener('scroll', schedule, true);
    };
  }, [enabled]);
  return ref;
}
