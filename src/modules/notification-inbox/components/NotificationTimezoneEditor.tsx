'use client';
import { useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Checkbox,
  Field,
  FormActions,
  TimezoneSelect,
} from '@/components/ui';
import { useCurrentTimezone } from '@/components/ui/lib/useCurrentTimezone';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import type { NotificationUserSettings } from '../models/notificationUserSettings';
import { NotificationTimezoneSchema } from '../models/notificationTimezone';
import { useSaveNotificationTimezone } from '../hooks';

export function NotificationTimezoneEditor({
  initial,
}: {
  initial: NotificationUserSettings;
}) {
  const [saved, setSaved] = useState(initial);
  const [automatic, setAutomatic] = useState(initial.timezone === null);
  const [timezone, setTimezone] = useState(
    initial.timezone ?? initial.effectiveTimezone,
  );
  const [validation, setValidation] = useState('');
  const browserTimezone = useCurrentTimezone();
  const mutation = useSaveNotificationTimezone();
  const presentation = usePresentationService();
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  const isDirty = (automatic ? null : timezone) !== saved.timezone;
  const displayedTimezone = automatic
    ? (browserTimezone ?? initial.effectiveTimezone)
    : timezone;
  function change(nextAutomatic: boolean, nextTimezone: string) {
    dirty.current = (nextAutomatic ? null : nextTimezone) !== saved.timezone;
    setAutomatic(nextAutomatic);
    setTimezone(nextTimezone);
    setValidation('');
    mutation.reset();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !isDirty) return;
    if (!automatic && !NotificationTimezoneSchema.safeParse(timezone).success) {
      setValidation(copy.validation.timezone);
      document.getElementById('notification-timezone')?.focus();
      return;
    }
    busy.current = true;
    try {
      const result = await mutation.mutateAsync(automatic ? null : timezone);
      setSaved(result);
      setAutomatic(result.timezone === null);
      setTimezone(result.timezone ?? result.effectiveTimezone);
      dirty.current = false;
      void presentation.showToast({
        title: copy.savedTimezoneTitle,
        intent: 'success',
      });
    } catch {
      /* Keep the timezone draft for retry. */
    } finally {
      busy.current = false;
    }
  }
  function discard() {
    setAutomatic(saved.timezone === null);
    setTimezone(saved.timezone ?? saved.effectiveTimezone);
    setValidation('');
    mutation.reset();
    dirty.current = false;
  }
  return (
    <form noValidate onSubmit={submit} className="grid gap-5">
      <div className="grid gap-2">
        <p className="m-0 text-sm font-medium text-primary">
          {copy.effectiveTimezoneHint(initial.effectiveTimezone)}
        </p>
        {browserTimezone && (
          <p className="m-0 text-sm text-secondary">
            {copy.detectedTimezoneHint(browserTimezone)}
          </p>
        )}
      </div>
      <Checkbox
        label={copy.browserTimezoneLabel}
        checked={automatic}
        onChange={(event) => change(event.target.checked, displayedTimezone)}
        disabled={mutation.isPending}
      />
      <Field labelText={copy.timezoneLabel}>
        <TimezoneSelect
          id="notification-timezone"
          value={displayedTimezone}
          disabled={automatic || mutation.isPending}
          onValueChange={(value) => change(false, value)}
          aria-invalid={Boolean(validation)}
          aria-describedby={
            validation
              ? 'notification-timezone-help notification-timezone-error'
              : 'notification-timezone-help'
          }
        />
      </Field>
      <p id="notification-timezone-help" className="m-0 text-sm text-secondary">
        {automatic ? copy.automaticTimezoneHint : copy.overrideTimezoneHint}
      </p>
      {validation && (
        <p
          id="notification-timezone-error"
          role="alert"
          className="m-0 text-sm text-error-primary"
        >
          {validation}
        </p>
      )}
      <MutationError error={mutation.error} />
      <FormActions
        variant="inline"
        sticky={false}
        description={isDirty ? copy.unsavedHint : undefined}
        live
      >
        <Button
          variant="destructive"
          onClick={discard}
          disabled={!isDirty || mutation.isPending}
        >
          {copy.discardAction}
        </Button>
        <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
          {copy.saveTimezoneAction}
        </Button>
      </FormActions>
    </form>
  );
}
