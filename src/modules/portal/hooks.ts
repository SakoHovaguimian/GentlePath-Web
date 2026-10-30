'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useServiceContainer } from '@/providers/AppProviders';
import type { ChildProfileInput } from './models/childProfile';
import type { JournalInput } from './models/journalEntry';
import type { ObservationInput } from './models/milestone';
import { portalQueryKeys as keys } from './queryKeys';
import { engagementQueryKeys } from '@/modules/engagement/queryKeys';
import { documentVaultQueryKeys } from '@/modules/documents/hooks';
import { milestoneAdminKeys } from '@/modules/milestone-admin/queryKeys';

export function usePortalOverview() {
  const { portalService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.overview,
    queryFn: ({ signal }) => service.overview(signal),
  });
}
export function useChildren() {
  const { portalService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.children,
    queryFn: ({ signal }) => service.children(signal),
  });
}
export function useJournals() {
  const { portalService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.journals,
    queryFn: ({ signal }) => service.journals(signal),
  });
}
export function useResources() {
  const { portalService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.resources,
    queryFn: ({ signal }) => service.resources(signal),
  });
}
export function useMilestones(childId: string) {
  const { portalService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.milestones(childId),
    queryFn: ({ signal }) => service.milestones(childId, signal),
    enabled: Boolean(childId),
  });
}
function usePortalMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
  relatedKeys: readonly QueryKey[] = [],
) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        cache.invalidateQueries({ queryKey: keys.all }),
        cache.invalidateQueries({ queryKey: engagementQueryKeys.all }),
        ...relatedKeys.map((queryKey) => cache.invalidateQueries({ queryKey })),
      ]),
  });
}
export function useSaveChild() {
  const { portalService: service } = useServiceContainer();
  return usePortalMutation(
    ({ input, id }: { input: ChildProfileInput; id?: string }) =>
      service.saveChild(input, id),
  );
}
export function useDeleteChild() {
  const { portalService: service } = useServiceContainer();
  return usePortalMutation(
    (id: string) => service.deleteChild(id),
    [documentVaultQueryKeys.all, milestoneAdminKeys.all],
  );
}
export function useSaveJournal() {
  const { portalService: service } = useServiceContainer();
  return usePortalMutation(
    ({ input, id }: { input: JournalInput; id?: string }) =>
      service.saveJournal(input, id),
  );
}
export function useDeleteJournal() {
  const { portalService: service } = useServiceContainer();
  return usePortalMutation((id: string) => service.deleteJournal(id));
}
export function useSaveResource() {
  const { portalService: service } = useServiceContainer();
  return usePortalMutation(({ id, saved }: { id: string; saved: boolean }) =>
    service.saveResource(id, saved),
  );
}
export function useObserveMilestone() {
  const { portalService: service } = useServiceContainer();
  return usePortalMutation(
    ({ id, input }: { id: string; input: ObservationInput }) =>
      service.observeMilestone(id, input),
  );
}
