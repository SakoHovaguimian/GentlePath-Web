'use client';

import { FamilyPreferencesBoundary } from './components/FamilyPreferencesBoundary';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useFamilyPreferences } from './hooks';

export function OnboardingGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const query = useFamilyPreferences();
  const exempt =
    pathname === '/onboarding' ||
    [
      '/dev-settings',
      '/admin',
      '/superadmin',
      '/settings/account',
      '/profile',
    ].some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  useEffect(() => {
    if (!exempt && query.data && !query.data.onboarding_completed_at) {
      const target = `${window.location.pathname}${window.location.search}`;
      router.replace(
        `/onboarding?redirectTo=${encodeURIComponent(target)}` as Route,
      );
    }
  }, [exempt, pathname, query.data, router]);
  if (exempt) return children;
  return (
    <FamilyPreferencesBoundary query={query}>
      {(settings) => (settings.onboarding_completed_at ? children : null)}
    </FamilyPreferencesBoundary>
  );
}
