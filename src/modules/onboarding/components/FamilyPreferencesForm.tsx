'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { gentlePathOnboardingStrings as copy } from '@/strings';
import { MutationError } from '@/modules/portal/components/MutationError';
import { useSaveFamilyPreferences } from '../hooks';
import type { FamilyPreferences } from '../models/familyPreferences';
import { ProfilePreferencesUpdateSchema } from '../models/profilePreferencesUpdate';
import type { DiscoveryPreferencesInput } from '../models/discoveryPreferencesInput';
import { DiscoveryPreferencesFields } from './DiscoveryPreferencesFields';
import { StateField } from './StateField';

export function FamilyPreferencesForm({
  settings,
}: {
  settings: FamilyPreferences;
}) {
  const [state, setState] = useState(settings.state_code ?? '');
  const [discovery, setDiscovery] = useState<DiscoveryPreferencesInput>({
    approaches: settings.discovery_approaches,
    no_preference:
      settings.discovery_preferences_answered &&
      settings.discovery_approaches.length === 0,
  });
  const [validation, setValidation] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const mutation = useSaveFamilyPreferences();
  const form = useRef<HTMLFormElement>(null);
  const savedStatus = useRef<HTMLParagraphElement>(null);
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  function changed() {
    dirty.current = true;
    setSaved(false);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = ProfilePreferencesUpdateSchema.safeParse({
      state_code: state,
      discovery,
    });
    if (!parsed.success) {
      setValidation(state ? copy.invalidSelection : copy.chooseState);
      form.current
        ?.querySelector<HTMLElement>(
          state ? 'input[type=checkbox]' : '[data-state-field] button',
        )
        ?.focus();
      return;
    }
    busy.current = true;
    setValidation(null);
    try {
      await mutation.mutateAsync(parsed.data);
      dirty.current = false;
      setSaved(true);
      window.requestAnimationFrame(() => savedStatus.current?.focus());
    } catch {
      /* The draft remains mounted. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <form
      ref={form}
      noValidate
      onSubmit={submit}
      className="grid min-w-0 gap-6"
    >
      <p className="text-sm text-tertiary">{copy.stateHint}</p>
      <StateField
        errorId={validation && !state ? 'preferences-validation' : undefined}
        value={state}
        onChange={(value) => {
          changed();
          setState(value);
        }}
        disabled={mutation.isPending}
      />
      <DiscoveryPreferencesFields
        value={discovery}
        onChange={(value) => {
          changed();
          setDiscovery(value);
        }}
        disabled={mutation.isPending}
      />
      {validation && (
        <p
          id="preferences-validation"
          role="alert"
          className="text-sm text-error-primary"
        >
          {validation}
        </p>
      )}
      <MutationError error={mutation.error} />
      {saved && (
        <p
          ref={savedStatus}
          tabIndex={-1}
          role="status"
          className="text-sm text-success-primary"
        >
          {copy.saved}
        </p>
      )}
      <div>
        <Button type="submit" loading={mutation.isPending}>
          {copy.save}
        </Button>
      </div>
    </form>
  );
}
