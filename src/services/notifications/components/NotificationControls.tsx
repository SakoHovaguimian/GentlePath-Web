'use client';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { useRealtime } from '@/services/realtime/RealtimeProvider';
import { strings } from '@/strings';
export function NotificationControls() {
  const realtime = useRealtime();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const state = realtime.notificationStatus;
  return (
    <section className="grid gap-3" aria-label={strings.notifications.title}>
      <h2 className="font-semibold">{strings.notifications.title}</h2>
      <p className="text-sm text-secondary">{strings.notifications[state]}</p>
      {(state === 'available' || state === 'enabled') && (
        <Button
          variant={state === 'enabled' ? 'destructive' : 'secondary'}
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setError('');
            try {
              if (state === 'enabled') await realtime.disableNotifications();
              else await realtime.enableNotifications();
            } catch {
              setError(strings.notifications.failed);
            } finally {
              setPending(false);
            }
          }}
        >
          {pending
            ? strings.notifications.busy
            : state === 'enabled'
              ? strings.notifications.disable
              : strings.notifications.enable}
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-error-primary">
          {error}
        </p>
      )}
    </section>
  );
}
