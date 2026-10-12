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
  AppearancePreferenceSchema,
  defaultAppearancePreference,
  type AppearancePreference,
} from '@/models/appearance';
import type { ThemePreferenceService } from '@/modules/settings/services/themePreferenceService';
import { strings } from '@/strings';

type ThemePreferenceContext = AppearancePreference & {
  setPreference: (value: AppearancePreference) => Promise<void>;
};
const ThemeContext = createContext<ThemePreferenceContext | null>(null);

function applyTheme(value: AppearancePreference) {
  const root = document.documentElement;
  root.classList.toggle('dark-mode', value.mode === 'dark');
  root.dataset.theme = value.mode;
  root.dataset.accent = value.accent;
}

export function ThemePreferenceProvider({
  children,
  service,
}: {
  children: ReactNode;
  service: ThemePreferenceService;
}) {
  const [preference, setPreferenceState] = useState(
    defaultAppearancePreference,
  );
  useEffect(() => {
    let active = true;
    const restore = () =>
      void service.getPreference().then((value) => {
        if (!active) return;
        setPreferenceState(value);
        applyTheme(value);
      });
    restore();
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'semantic-web-theme' || event.key === null) restore();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      active = false;
      window.removeEventListener('storage', onStorage);
    };
  }, [service]);

  const theme = useMemo(
    () => ({
      ...preference,
      setPreference: async (value: AppearancePreference) => {
        const saved = await service.savePreference(
          AppearancePreferenceSchema.parse(value),
        );
        setPreferenceState(saved);
        applyTheme(saved);
      },
    }),
    [preference, service],
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useThemePreference() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error(strings.errors.provider);
  return value;
}
