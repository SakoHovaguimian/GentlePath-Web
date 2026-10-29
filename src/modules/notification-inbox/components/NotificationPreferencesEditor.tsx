'use client';
import { useRef, useState, type FormEvent } from 'react';
import { Button, FormActions } from '@/components/ui';
import { Switch } from '@/components/ui/components/Switch';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import { NotificationCategorySchema } from '../models/notificationCategory';
import { NotificationChannelSchema } from '../models/notificationChannel';
import type { NotificationPreference } from '../models/notificationPreference';
import { useSaveNotificationPreferences } from '../hooks';

export function NotificationPreferencesEditor({
  initial,
}: {
  initial: NotificationPreference[];
}) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(() =>
    initial.map((item) => ({ ...item })),
  );
  const mutation = useSaveNotificationPreferences();
  const presentation = usePresentationService();
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  function change(
    category: NotificationPreference['category'],
    channel: NotificationPreference['channel'],
    enabled: boolean,
  ) {
    const next = draft.map((item) =>
      item.category === category && item.channel === channel
        ? { ...item, enabled }
        : item,
    );
    dirty.current = JSON.stringify(next) !== JSON.stringify(saved);
    mutation.reset();
    setDraft(next);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !isDirty) return;
    busy.current = true;
    try {
      const preferences = draft.filter(
        (entry) =>
          saved.find(
            (item) =>
              item.category === entry.category &&
              item.channel === entry.channel,
          )?.enabled !== entry.enabled,
      );
      const result = await mutation.mutateAsync({ preferences });
      setSaved(result);
      setDraft(result.map((item) => ({ ...item })));
      dirty.current = false;
      void presentation.showToast({
        title: copy.savedPreferencesTitle,
        intent: 'success',
      });
    } catch {
      /* Keep each channel choice for retry. */
    } finally {
      busy.current = false;
    }
  }
  function discard() {
    setDraft(saved.map((item) => ({ ...item })));
    dirty.current = false;
    mutation.reset();
  }
  return (
    <form noValidate onSubmit={submit} className="grid gap-5">
      <div className="grid divide-y divide-secondary">
        {NotificationCategorySchema.options.map((category) => (
          <fieldset
            key={category}
            className="grid min-w-0 gap-3 border-0 px-0 py-5 first:pt-0"
          >
            <legend className="float-left w-full text-base font-semibold text-primary">
              {copy.categories[category]}
            </legend>
            <p className="m-0 clear-both text-sm text-secondary">
              {copy.categoryDescriptions[category]}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {NotificationChannelSchema.options.map((channel) => {
                const entry = draft.find(
                  (item) =>
                    item.category === category && item.channel === channel,
                );
                return (
                  <Switch
                    key={channel}
                    label={copy.channels[channel]}
                    checked={entry?.enabled ?? false}
                    disabled={mutation.isPending || !entry}
                    onChange={(event) =>
                      change(category, channel, event.target.checked)
                    }
                  />
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <MutationError error={mutation.error} />
      <FormActions
        variant="inline"
        sticky={false}
        description={isDirty ? copy.unsavedHint : copy.savedHint}
        live
      >
        <Button
          variant="secondary"
          onClick={discard}
          disabled={!isDirty || mutation.isPending}
        >
          {copy.discardAction}
        </Button>
        <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
          {copy.savePreferencesAction}
        </Button>
      </FormActions>
    </form>
  );
}
