'use client';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentTimezone } from '@/components/ui/lib/useCurrentTimezone';
import { useServiceContainer, useSessionState } from '@/providers/AppProviders';
import { useNotificationSettings } from '../hooks';
import { NotificationTimezoneSchema } from '../models/notificationTimezone';
import { notificationInboxQueryKeys } from '../queryKeys';

/** Records detection only; this endpoint cannot change the deliberate override. */
export function NotificationTimezoneSync() {
  const { notificationInboxService } = useServiceContainer();
  const { session } = useSessionState();
  const settings = useNotificationSettings();
  const timezone = useCurrentTimezone();
  const attempted = useRef(new Set<string>());
  const cache = useQueryClient();
  useEffect(() => {
    if (
      !session ||
      !settings.data ||
      !timezone ||
      settings.data.userId !== session.user.id
    )
      return;
    if (
      !NotificationTimezoneSchema.safeParse(timezone).success ||
      settings.data.lastTimezone === timezone
    )
      return;
    const key = `${session.user.id}:${timezone}`;
    if (attempted.current.has(key)) return;
    attempted.current.add(key);
    void notificationInboxService
      .syncDetectedTimezone(timezone)
      .then(() => {
        // Revalidate rather than replacing a possibly newer manual settings save.
        void cache.invalidateQueries({
          queryKey: notificationInboxQueryKeys.settings,
        });
      })
      .catch(() => {
        // A background detection failure never blocks the workspace or loops on render.
      });
  }, [session, settings.data, timezone, notificationInboxService, cache]);
  return null;
}
