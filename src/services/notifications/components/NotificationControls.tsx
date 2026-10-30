'use client';

import { useState } from 'react';
import { Button, Card, UiIcon } from '@/components/ui';
import { useRealtime } from '@/services/realtime/RealtimeProvider';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { strings } from '@/strings';
import styles from './NotificationControls.module.css';

export function NotificationControls({
  variant = 'settings',
}: {
  variant?: 'settings' | 'inbox';
}) {
  const realtime = useRealtime();
  const runtime = useRuntimeConfig();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const state = realtime.notificationStatus;
  const undecided = state === 'undecided';
  const enabled = state === 'enabled';
  const canEnable = undecided || state === 'off';
  const busy = pending || realtime.notificationPending;
  async function apply(action: () => Promise<void>) {
    if (busy) return;
    setPending(true);
    setError('');
    try {
      await action();
    } catch {
      setError(strings.notifications.failed);
    } finally {
      setPending(false);
    }
  }
  if (variant === 'inbox' && (enabled || state === 'loading')) return null;
  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {canEnable && (
        <Button
          disabled={busy}
          loading={busy}
          onClick={() => void apply(realtime.enableNotifications)}
        >
          <UiIcon name="bell" className="size-4" />
          {strings.notifications.enable}
        </Button>
      )}
      {undecided && (
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() => void apply(realtime.disableNotifications)}
        >
          {strings.notifications.keepOff}
        </Button>
      )}
      {enabled && (
        <Button
          variant="destructive"
          disabled={busy}
          loading={busy}
          onClick={() => void apply(realtime.disableNotifications)}
        >
          {strings.notifications.disable}
        </Button>
      )}
      {state === 'denied' && (
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => void apply(realtime.refreshNotifications)}
        >
          {strings.notifications.checkAgain}
        </Button>
      )}
    </div>
  );
  const message = (
    <>
      {runtime.demoMode && (
        <p className="m-0 text-xs text-tertiary">
          {strings.notifications.demo}
        </p>
      )}
      {error && (
        <p role="alert" className="m-0 text-sm text-error-primary">
          {error}
        </p>
      )}
    </>
  );
  if (variant === 'inbox')
    return (
      <Card
        className={styles.permissionCard}
        data-decision={undecided ? 'undecided' : 'off'}
      >
        <div className={styles.visual} aria-hidden="true">
          <UiIcon name={undecided ? 'bell' : 'warning'} className="size-6" />
        </div>
        <div className={styles.copy}>
          <h2>
            {undecided
              ? strings.notifications.decisionTitle
              : strings.notifications.offTitle}
          </h2>
          <p>
            {undecided
              ? strings.notifications.decisionDescription
              : strings.notifications[state]}
          </p>
          {actions}
          {message}
        </div>
      </Card>
    );
  return (
    <section
      className="grid gap-3"
      aria-label={strings.notifications.title}
      aria-busy={busy}
    >
      <p className="m-0 text-sm text-secondary">
        {strings.notifications[state]}
      </p>
      {actions}
      {message}
    </section>
  );
}
