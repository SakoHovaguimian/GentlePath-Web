'use client';

import { useEffect } from 'react';

/** Resolve page-entry anchors after the guidance query renders its sections. */
export function MilestoneAnchorSync() {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const fragment = window.location.hash.slice(1);
      if (fragment)
        document
          .getElementById(fragment)
          ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return null;
}
