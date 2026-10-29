'use client';

import { useRef, useState } from 'react';
import {
  Button,
  Card,
  PageHeader,
  QueryBoundary,
  Switch,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { PlatformSettings } from './models/platformSettings';
import { usePlatformSettings, useSavePlatformSettings } from './adminHooks';
import { MutationError } from './components/MutationError';

function PlatformSettingsForm({ initial }: { initial: PlatformSettings }) {
  const [settings, setSettings] = useState(initial);
  const mutation = useSavePlatformSettings();
  const { showAlert, showToast } = usePresentationService();
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  const fields = [
    {
      key: 'communityEnabled' as const,
      label: copy.system.community,
      description: copy.system.communityDescription,
    },
    {
      key: 'registrationsEnabled' as const,
      label: copy.system.registrations,
      description: copy.system.registrationsDescription,
    },
    {
      key: 'maintenanceMode' as const,
      label: copy.system.maintenance,
      description: copy.system.maintenanceDescription,
    },
    {
      key: 'resourceReviewRequired' as const,
      label: copy.system.review,
      description: copy.system.reviewDescription,
    },
  ];
  return (
    <form
      noValidate
      className="grid gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (
          busy.current ||
          !(await showAlert({
            title: copy.system.confirmTitle,
            description: copy.system.confirmDescription,
            tone: 'warning',
            confirmLabel: copy.system.confirmAction,
            cancelLabel: copy.common.cancel,
          }))
        )
          return;
        busy.current = true;
        try {
          await mutation.mutateAsync(settings);
          dirty.current = false;
          void showToast({ title: copy.system.saved, intent: 'success' });
        } catch {
          /* Inline recovery. */
        } finally {
          busy.current = false;
        }
      }}
    >
      <Card className="grid gap-5 p-6 sm:p-8">
        <h2 className="m-0 font-display text-xl">{copy.system.general}</h2>
        <div className="divide-y divide-secondary">
          {fields.map((field) => (
            <div key={field.key} className="py-5">
              <Switch
                label={field.label}
                description={field.description}
                checked={settings[field.key]}
                disabled={mutation.isPending}
                onChange={(event) => {
                  const next = {
                    ...settings,
                    [field.key]: event.target.checked,
                  };
                  dirty.current =
                    JSON.stringify(next) !== JSON.stringify(initial);
                  setSettings(next);
                }}
              />
            </div>
          ))}
        </div>
      </Card>
      <MutationError error={mutation.error} />
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={mutation.isPending}
          disabled={JSON.stringify(settings) === JSON.stringify(initial)}
        >
          {copy.common.save}
        </Button>
      </div>
    </form>
  );
}
export function PlatformSettingsScreen() {
  const query = usePlatformSettings();
  return (
    <div className="grid max-w-4xl gap-7">
      <PageHeader
        title={copy.system.title}
        description={copy.system.description}
        eyebrow={copy.navigation.role.superadmin}
      />
      <QueryBoundary query={query}>
        {(settings) => <PlatformSettingsForm initial={settings} />}
      </QueryBoundary>
    </div>
  );
}
