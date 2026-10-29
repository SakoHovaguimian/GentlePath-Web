'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { strings } from '@/strings';
import { confirmNavigationGuards } from './confirmNavigationGuards';
import type {
  NavigationGuard,
  NavigationGuardService,
} from './models/navigationGuard';

const NavigationGuardContext = createContext<NavigationGuardService | null>(
  null,
);

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const guards = useRef(new Map<symbol, NavigationGuard>());
  const checkingRef = useRef(false);
  const register = useCallback((guard: NavigationGuard) => {
    const key = Symbol();
    guards.current.set(key, guard);
    return () => {
      guards.current.delete(key);
    };
  }, []);
  const confirmNavigation = useCallback(() => {
    if (checkingRef.current) return false;
    checkingRef.current = true;
    // Awaited confirmations can re-render forms and replace registrations.
    // Only check the guards present when this navigation was requested.
    const navigationGuards = Array.from(guards.current.values());
    try {
      const allowed = confirmNavigationGuards(navigationGuards);
      if (typeof allowed !== 'boolean') {
        return allowed.finally(() => {
          checkingRef.current = false;
        });
      }
      checkingRef.current = false;
      return allowed;
    } catch (error) {
      checkingRef.current = false;
      throw error;
    }
  }, []);
  const value = useMemo(
    () => ({ register, confirmNavigation }),
    [register, confirmNavigation],
  );
  return (
    <NavigationGuardContext.Provider value={value}>
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  const service = useContext(NavigationGuardContext);
  if (!service) throw new Error(strings.errors.provider);
  return service;
}
