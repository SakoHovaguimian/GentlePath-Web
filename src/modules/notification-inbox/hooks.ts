'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer, useSessionState } from '@/providers/AppProviders';
import type {
  NotificationInboxQuery,
  NotificationInboxFilters,
} from './models/notificationInboxQuery';
import type { NotificationBulkReadInput } from './models/notificationReadInput';
import type { NotificationArchiveInput } from './models/notificationArchiveInput';
import type { NotificationPreferencesInput } from './models/notificationPreference';
import { notificationInboxQueryKeys as keys } from './queryKeys';

export function useNotificationInbox(query: NotificationInboxQuery) {
  const { notificationInboxService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.list(query),
    queryFn: ({ signal }) => service.inbox(query, signal),
  });
}
export function useNotificationCounts(
  filters: Omit<NotificationInboxFilters, 'read'> = {},
) {
  const { notificationInboxService: service } = useServiceContainer();
  const { session } = useSessionState();
  return useQuery({
    queryKey: keys.counts(filters),
    queryFn: ({ signal }) => service.counts(filters, signal),
    enabled: Boolean(session),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}
export function useNotificationPreferences() {
  const { notificationInboxService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.preferences,
    queryFn: ({ signal }) => service.preferences(signal),
  });
}
export function useNotificationSettings() {
  const { notificationInboxService: service } = useServiceContainer();
  const { session } = useSessionState();
  return useQuery({
    queryKey: keys.settings,
    queryFn: ({ signal }) => service.settings(signal),
    enabled: Boolean(session),
  });
}
function useInboxMutation<T, R>(mutationFn: (input: T) => Promise<R>) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => cache.invalidateQueries({ queryKey: keys.all }),
  });
}
export function useNotificationRead() {
  const { notificationInboxService: service } = useServiceContainer();
  return useInboxMutation(({ id, read }: { id: string; read: boolean }) =>
    service.setRead(id, read),
  );
}
export function useNotificationBulkRead() {
  const { notificationInboxService: service } = useServiceContainer();
  return useInboxMutation((input: NotificationBulkReadInput) =>
    service.setBulkRead(input),
  );
}
export function useArchiveNotification() {
  const { notificationInboxService: service } = useServiceContainer();
  return useInboxMutation((id: string) => service.archive(id));
}
export function useArchiveNotifications() {
  const { notificationInboxService: service } = useServiceContainer();
  return useInboxMutation((input: NotificationArchiveInput) =>
    service.archiveBulk(input),
  );
}
export function useSaveNotificationPreferences() {
  const { notificationInboxService: service } = useServiceContainer();
  return useInboxMutation((input: NotificationPreferencesInput) =>
    service.savePreferences(input),
  );
}
export function useSaveNotificationTimezone() {
  const { notificationInboxService: service } = useServiceContainer();
  return useInboxMutation((timezone: string | null) =>
    service.setTimezone(timezone),
  );
}
