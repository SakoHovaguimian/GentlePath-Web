'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer } from '@/providers/AppProviders';
import type { ManagedUserInput } from './models/managedUser';
import type { ReportResolution } from './models/moderationReport';
import type { PlatformSettings } from './models/platformSettings';
import { adminQueryKeys as keys } from './queryKeys';

export function useAdminOverview() {
  const { adminService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.overview,
    queryFn: ({ signal }) => service.overview(signal),
  });
}
export function useManagedUsers() {
  const { adminService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.users,
    queryFn: ({ signal }) => service.users(signal),
  });
}
export function useModerationReports() {
  const { adminService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.reports,
    queryFn: ({ signal }) => service.reports(signal),
  });
}
export function usePlatformSettings() {
  const { adminService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.settings,
    queryFn: ({ signal }) => service.settings(signal),
  });
}
function useAdminMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => cache.invalidateQueries({ queryKey: keys.all }),
  });
}
export function useUpdateManagedUser() {
  const { adminService: service } = useServiceContainer();
  return useAdminMutation(
    ({ id, input }: { id: string; input: ManagedUserInput }) =>
      service.updateUser(id, input),
  );
}
export function useResolveReport() {
  const { adminService: service } = useServiceContainer();
  return useAdminMutation(
    ({ id, input }: { id: string; input: ReportResolution }) =>
      service.resolveReport(id, input),
  );
}
export function useSavePlatformSettings() {
  const { adminService: service } = useServiceContainer();
  return useAdminMutation((input: PlatformSettings) =>
    service.saveSettings(input),
  );
}
