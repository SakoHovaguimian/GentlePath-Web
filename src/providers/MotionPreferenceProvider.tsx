'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  defaultMotionPreference,
  type MotionPreference,
} from '@/models/motionPreference';
import type { MotionPreferenceService } from '@/modules/settings/services/motionPreferenceService';
import { strings } from '@/strings';

const MotionContext = createContext<{
  preference: MotionPreference;
  setPreference: (value: MotionPreference) => Promise<void>;
} | null>(null);

export function MotionPreferenceProvider({
  children,
  service,
}: {
  children: ReactNode;
  service: MotionPreferenceService;
}) {
  const [preference, setPreferenceState] = useState(defaultMotionPreference);
  useEffect(() => {
    let active = true;
    const restore = () =>
      void service.getPreference().then((value) => {
        if (!active) return;
        setPreferenceState(value);
        document.documentElement.dataset.motion = value;
      });
    restore();
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'portal-motion' || event.key === null) restore();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      active = false;
      window.removeEventListener('storage', onStorage);
    };
  }, [service]);
  const value = useMemo(
    () => ({
      preference,
      setPreference: async (next: MotionPreference) => {
        const saved = await service.savePreference(next);
        setPreferenceState(saved);
        document.documentElement.dataset.motion = saved;
      },
    }),
    [preference, service],
  );
  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

export function useMotionPreference() {
  const value = useContext(MotionContext);
  if (!value) throw new Error(strings.errors.provider);
  return value;
}
