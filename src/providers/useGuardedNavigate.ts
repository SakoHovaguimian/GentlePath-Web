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
    (href: string) => {
      const allowed = confirmNavigation();
      if (typeof allowed === 'boolean') {
        if (allowed) router.push(href as Route);
        return;
      }
      return allowed.then((confirmed) => {
        if (confirmed) router.push(href as Route);
      });
    },
    [confirmNavigation, router],
  );
}
