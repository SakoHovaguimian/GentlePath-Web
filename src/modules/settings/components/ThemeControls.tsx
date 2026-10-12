'use client';

import { useRef, useState } from 'react';
import { Field, Select, SegmentedTabs } from '@/components/ui';
import {
  AccentThemeSchema,
  ThemeModeSchema,
  type AccentTheme,
  type ThemeMode,
} from '@/models/appearance';
import { useThemePreference } from '@/providers/ThemePreferenceProvider';
import { useMotionPreference } from '@/providers/MotionPreferenceProvider';
import { labels, strings } from '@/strings';

const copy = strings.designSystem;
const motionValues = { system: 'system', reduced: 'reduced' } as const;
const modes: Array<{ value: ThemeMode; label: string }> = [
  {
    value: ThemeModeSchema.enum.light,
    label: strings.ui.appearanceScreen.light,
  },
  { value: ThemeModeSchema.enum.dark, label: strings.ui.appearanceScreen.dark },
];

export function ThemeControls() {
  const theme = useThemePreference();
  const motion = useMotionPreference();
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [error, setError] = useState('');
  async function save(action: () => Promise<void>) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setError('');
    try {
      await action();
    } catch {
      setError(copy.preferenceFailed);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }
  return (
    <div className="grid min-w-0 gap-4">
      <div
        className="grid min-w-0 items-end gap-5 sm:grid-cols-2 xl:grid-cols-3"
        aria-busy={pending}
      >
        <div className="grid min-w-0 gap-1.5">
          <span className="text-sm font-medium text-secondary">
            {copy.mode}
          </span>
          <SegmentedTabs
            tabs={modes}
            label={copy.mode}
            value={theme.mode}
            disabled={pending}
            onValueChange={(mode) =>
              void save(() =>
                theme.setPreference({ mode, accent: theme.accent }),
              )
            }
          />
        </div>
        <Field labelText={copy.accent}>
          <Select
            value={theme.accent}
            disabled={pending}
            leadingIcon={
              <span
                aria-hidden="true"
                data-accent={theme.accent}
                className="accent-preview size-5 rounded-full bg-(--color-brand-600)"
              />
            }
            onValueChange={(value) =>
              void save(() =>
                theme.setPreference({
                  mode: theme.mode,
                  accent: value as AccentTheme,
                }),
              )
            }
          >
            {AccentThemeSchema.options.map((accent) => (
              <option key={accent} value={accent}>
                {labels.accents[accent]}
              </option>
            ))}
          </Select>
        </Field>
        <Field labelText={copy.motion}>
          <Select
            value={motion.preference}
            disabled={pending}
            onValueChange={(value) =>
              void save(() =>
                motion.setPreference(
                  value === 'reduced' ? 'reduced' : 'system',
                ),
              )
            }
          >
            <option value={motionValues.system}>{copy.systemMotion}</option>
            <option value={motionValues.reduced}>{copy.reducedMotion}</option>
          </Select>
        </Field>
      </div>
      <p className="m-0 text-sm text-tertiary">{copy.motionHint}</p>
      {error && (
        <p role="alert" className="m-0 text-sm text-error-primary">
          {error}
        </p>
      )}
    </div>
  );
}
