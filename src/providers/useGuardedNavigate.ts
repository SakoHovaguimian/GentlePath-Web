'use client';

import { useCallback } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useNavigationGuard } from './NavigationGuardProvider';

// Client navigation that first asks the active form's leave guard.
// Pass it to PageHeader/Breadcrumbs `onNavigate` and guarded link handlers.
export function useGuardedNavigate() {
  const router = useRouter();
  const { confirmNavigation } = useNavigationGuard();
  return useCallback(
    async (href: string) => {
      if (await confirmNavigation()) router.push(href as Route);
    },
    [confirmNavigation, router],
  );
}
