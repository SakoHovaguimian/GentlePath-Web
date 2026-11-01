'use client';

import { useEffect } from 'react';

/** Keep a clicked section fragment only while that section is still in view. */
export function LandingAnchorSync() {
  useEffect(() => {
    let pending: ReturnType<typeof setTimeout> | undefined;

    function clearStaleAnchor() {
      const fragment = window.location.hash.slice(1);
      if (!fragment) return;

      const target = document.getElementById(fragment);
      const section = target?.closest('section');
      if (!section) return;

      const bounds = section.getBoundingClientRect();
      const readingPosition = window.innerHeight * 0.25;
      if (bounds.top <= readingPosition && bounds.bottom > readingPosition) {
        return;
      }

      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}`,
      );
    }

    function scheduleSync() {
      clearTimeout(pending);
      // Let native anchor navigation finish before checking a settled position.
      pending = setTimeout(clearStaleAnchor, 180);
    }

    window.addEventListener('scroll', scheduleSync, { passive: true });
    document.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('hashchange', scheduleSync);

    return () => {
      clearTimeout(pending);
      window.removeEventListener('scroll', scheduleSync);
      document.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('hashchange', scheduleSync);
    };
  }, []);

  return null;
}
