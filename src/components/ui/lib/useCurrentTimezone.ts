'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getServerSnapshot = () => null;
const getSnapshot = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// Wait for the browser snapshot before mounting date editors. Server timezone
// settings must not initialize or briefly display the user's local draft.
export function useCurrentTimezone(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
