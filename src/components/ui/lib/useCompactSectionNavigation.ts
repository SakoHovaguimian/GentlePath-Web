'use client';

import { useSyncExternalStore } from 'react';

// Keep this viewport boundary aligned with the section navigation CSS.
const compactQuery = '(width < 600px)';

function subscribeCompact(onChange: () => void) {
  const query = window.matchMedia(compactQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function compactSnapshot() {
  return window.matchMedia(compactQuery).matches;
}

function serverSnapshot() {
  return true;
}

export function useCompactSectionNavigation() {
  return useSyncExternalStore(
    subscribeCompact,
    compactSnapshot,
    serverSnapshot,
  );
}
