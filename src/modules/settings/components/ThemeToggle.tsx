'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { useThemePreference } from '@/providers/ThemePreferenceProvider';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { strings } from '@/strings';

export function ThemeToggle() {
  const { mode, accent, setPreference } = useThemePreference();
  const presentation = usePresentationService();
  const [pending, setPending] = useState(false);
  const dark = mode === 'dark';

  async function toggleTheme() {
    if (pending) return;
    setPending(true);
    try {
      await setPreference({ mode: dark ? 'light' : 'dark', accent });
    } catch {
      await presentation.showToast({
        title: strings.ui.shellActions.themeSaveFailed,
        intent: 'danger',
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="ghost"
      className="h-11 w-11 shrink-0 px-0"
      aria-label={strings.ui.shellActions.darkMode}
      aria-pressed={dark}
      aria-busy={pending}
      title={
        dark
          ? strings.ui.shellActions.switchToLight
          : strings.ui.shellActions.switchToDark
      }
      disabled={pending}
      onClick={() => void toggleTheme()}
    >
      <svg
        viewBox="0 0 20 20"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="10" cy="10" r="3" />
            <path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.3 4.3l1.4 1.4m8.6 8.6 1.4 1.4M4.3 15.7l1.4-1.4m8.6-8.6 1.4-1.4" />
          </>
        ) : (
          <path d="M17 11.8A7.3 7.3 0 0 1 8.2 3a7.3 7.3 0 1 0 8.8 8.8Z" />
        )}
      </svg>
    </Button>
  );
}
