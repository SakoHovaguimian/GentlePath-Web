'use client';

import { useRef, useState } from 'react';
import { Radio, UiIcon } from '@/components/ui';
import type { ThemeMode } from '@/models/appearance';
import { useThemePreference } from '@/providers/ThemePreferenceProvider';
import { strings } from '@/strings';
import './themeControls.css';

const modes = ['light', 'dark'] as const;

export function ThemeControls() {
  const theme = useThemePreference();
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [error, setError] = useState('');

  async function save(mode: ThemeMode) {
    if (pendingRef.current || mode === theme.mode) return;
    pendingRef.current = true;
    setPending(true);
    setError('');
    try {
      await theme.setPreference({ mode, accent: theme.accent });
    } catch {
      setError(strings.designSystem.preferenceFailed);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-4">
      <fieldset className="min-w-0" disabled={pending} aria-busy={pending}>
        <legend className="sr-only">{strings.designSystem.mode}</legend>
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {modes.map((mode) => (
            <Radio
              key={mode}
              name="appearance-mode"
              value={mode}
              checked={theme.mode === mode}
              onChange={() => void save(mode)}
              className="ui-theme-choice"
              label={
                <span className="grid gap-4">
                  <span
                    aria-hidden="true"
                    className="ui-theme-preview"
                    data-preview-theme={mode}
                  >
                    <span className="ui-theme-preview__sidebar" />
                    <span className="ui-theme-preview__content">
                      <span />
                      <span />
                      <span />
                    </span>
                  </span>
                  <span className="flex items-center gap-2 font-semibold">
                    <UiIcon
                      name={mode === 'light' ? 'sun' : 'moon'}
                      className="size-5"
                    />
                    {strings.ui.appearanceScreen[mode]}
                  </span>
                </span>
              }
            />
          ))}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="m-0 text-sm text-error-primary">
          {error}
        </p>
      )}
    </div>
  );
}
