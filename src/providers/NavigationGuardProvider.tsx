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

type NavigationGuard = () => Promise<boolean>;
type NavigationGuardService = {
  register: (guard: NavigationGuard) => () => void;
  confirmNavigation: NavigationGuard;
};

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
  const confirmNavigation = useCallback(async () => {
    if (checkingRef.current) return false;
    checkingRef.current = true;
    // Awaited confirmations can re-render forms and replace registrations.
    // Only check the guards present when this navigation was requested.
    const navigationGuards = Array.from(guards.current.values());
    try {
      for (const guard of navigationGuards) {
        if (!(await guard())) return false;
      }
      return true;
    } finally {
      checkingRef.current = false;
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
