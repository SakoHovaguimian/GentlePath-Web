'use client';

import { useRef, useState } from 'react';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import {
  Button,
  Card,
  FormActions,
  PageHeader,
  QueryBoundary,
  Switch,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { PlatformSettings } from './models/platformSettings';
import { usePlatformSettings, useSavePlatformSettings } from './adminHooks';
import { MutationError } from './components/MutationError';
import styles from './Admin.module.css';

function PlatformSettingsForm({ initial }: { initial: PlatformSettings }) {
  const [settings, setSettings] = useState(initial);
  const { demoMode } = useRuntimeConfig();
  const mutation = useSavePlatformSettings();
  const { showAlert, showToast } = usePresentationService();
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  const destructive =
    (initial.communityEnabled && !settings.communityEnabled) ||
    (initial.registrationsEnabled && !settings.registrationsEnabled) ||
    (!initial.maintenanceMode && settings.maintenanceMode) ||
    (initial.resourceReviewRequired && !settings.resourceReviewRequired);
  const fields = [
    {
      key: 'communityEnabled' as const,
      label: copy.system.community,
      description: copy.system.communityDescription,
      icon: 'mail' as const,
      tone: 'sage',
    },
    {
      key: 'registrationsEnabled' as const,
      label: copy.system.registrations,
      description: copy.system.registrationsDescription,
      icon: 'user' as const,
      tone: 'lilac',
    },
    {
      key: 'maintenanceMode' as const,
      label: copy.system.maintenance,
      description: copy.system.maintenanceDescription,
      icon: 'settings' as const,
      tone: 'sunlight',
    },
    {
      key: 'resourceReviewRequired' as const,
      label: copy.system.review,
      description: copy.system.reviewDescription,
      icon: 'checklist' as const,
      tone: 'clay',
    },
  ];
  return (
    <form
      noValidate
      className={styles.settingsForm}
      onSubmit={async (event) => {
        event.preventDefault();
        if (
          busy.current ||
          !(await showAlert({
            title: copy.system.confirmTitle,
            description: copy.system.confirmDescription,
            tone: destructive ? 'danger' : 'warning',
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
      <Card className={`${styles.settingsPanel} p-0 sm:p-0`}>
        <div
          className={`${styles.settingsPanelHeading} ${styles.panelHeading}`}
        >
          <span className={styles.roundIcon} data-tone="sunlight">
            <UiIcon name="settings" />
          </span>
          <h2>{copy.system.general}</h2>
        </div>
        <div className={styles.settingsRows}>
          {fields
            .filter(
              (field) => demoMode || field.key !== 'resourceReviewRequired',
            )
            .map((field) => (
              <div key={field.key} className={styles.settingRow}>
                <span className={styles.roundIcon} data-tone={field.tone}>
                  <UiIcon name={field.icon} />
                </span>
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
      <FormActions sticky={false}>
        <Button
          type="submit"
          variant="primary"
          loading={mutation.isPending}
          disabled={JSON.stringify(settings) === JSON.stringify(initial)}
        >
          {copy.common.save}
        </Button>
      </FormActions>
    </form>
  );
}
export function PlatformSettingsScreen() {
  const query = usePlatformSettings();
  return (
    <div className={`${styles.page} max-w-5xl`}>
      <div className={styles.intro} data-tone="sunlight">
        <PageHeader
          title={copy.system.title}
          description={copy.system.description}
          eyebrow={copy.navigation.role.superadmin}
        />
      </div>
      <QueryBoundary query={query}>
        {(settings) => <PlatformSettingsForm initial={settings} />}
      </QueryBoundary>
    </div>
  );
}
