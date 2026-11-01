'use client';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { communityQueryKeys } from '@/modules/community/queryKeys';
import { editorialQueryKeys } from '@/modules/editorial/queryKeys';
import { blogQueryKeys } from '@/modules/blog/queryKeys';
import { pollQueryKeys } from '@/modules/polls/queryKeys';
import { engagementQueryKeys } from '@/modules/engagement/queryKeys';
import { useServiceContainer } from '@/providers/AppProviders';
import { portalQueryKeys } from '@/modules/portal/queryKeys';
import { milestoneAdminKeys as keys } from './queryKeys';
import type { MilestoneAdminQuery } from './models/milestoneAdminQuery';
import type { MilestoneGuidanceInput } from './models/milestoneGuidance';
import type { FamilyTipInput } from './models/familyTip';
import type { TipReviewInput } from './models/tipReview';
import type { MilestoneObservationInput } from './models/milestoneObservation';
import type { MilestoneObservationQuery } from './models/milestoneObservationQuery';
export function useMilestoneGuidance(
  query: MilestoneAdminQuery,
  admin = false,
) {
  const { milestoneAdminService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...keys.milestones(query), { admin }],
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => service.milestones(query, signal, admin),
  });
}
export function useMilestoneGuidanceDetail(id: string, admin = false) {
  const { milestoneAdminService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...keys.milestone(id), { admin }],
    queryFn: ({ signal }) => service.milestone(id, signal, admin),
    enabled: Boolean(id),
  });
}
export function useMilestoneChoices() {
  const { milestoneAdminService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...keys.all, 'choices'],
    queryFn: ({ signal }) => service.milestoneChoices(signal),
  });
}
export function useMilestoneProgressSummary(childId: string) {
  const { milestoneAdminService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.progress(childId),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => service.progressSummary(childId, signal),
    enabled: Boolean(childId),
  });
}
export function useFamilyTip(id: string) {
  const { milestoneAdminService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...keys.all, 'tip', id],
    queryFn: ({ signal }) => service.tip(id, signal),
    enabled: Boolean(id),
  });
}
export function useFamilyTips(
  scope: 'approved' | 'mine' | 'review',
  query: MilestoneAdminQuery,
) {
  const { milestoneAdminService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.tips(scope, query),
    queryFn: ({ signal }) => service.tips(scope, query, signal),
  });
}
function useMilestoneMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        cache.invalidateQueries({ queryKey: communityQueryKeys.all }),
        cache.invalidateQueries({ queryKey: editorialQueryKeys.all }),
        cache.invalidateQueries({ queryKey: blogQueryKeys.all }),
        cache.invalidateQueries({ queryKey: pollQueryKeys.all }),
        cache.invalidateQueries({ queryKey: engagementQueryKeys.all }),
        cache.invalidateQueries({ queryKey: keys.all }),
        cache.invalidateQueries({ queryKey: portalQueryKeys.all }),
      ]);
    },
  });
}
export function useSaveMilestoneGuidance() {
  const { milestoneAdminService: service } = useServiceContainer();
  return useMilestoneMutation(
    ({ input, id }: { input: MilestoneGuidanceInput; id?: string }) =>
      service.saveMilestone(input, id),
  );
}
export function useHideMilestoneGuidance() {
  const { milestoneAdminService: service } = useServiceContainer();
  return useMilestoneMutation((id: string) => service.hideMilestone(id));
}
export function useRestoreMilestoneGuidance() {
  const { milestoneAdminService: service } = useServiceContainer();
  return useMilestoneMutation((id: string) => service.restoreMilestone(id));
}
export function useSaveFamilyTip() {
  const { milestoneAdminService: service } = useServiceContainer();
  return useMilestoneMutation(
    ({ input, id }: { input: FamilyTipInput; id?: string }) =>
      service.saveTip(input, id),
  );
}
export function useDeleteFamilyTip() {
  const { milestoneAdminService: service } = useServiceContainer();
  return useMilestoneMutation((id: string) => service.deleteTip(id));
}
export function useReviewFamilyTip() {
  const { milestoneAdminService: service } = useServiceContainer();
  return useMilestoneMutation(
    ({ id, input }: { id: string; input: TipReviewInput }) =>
      service.reviewTip(id, input),
  );
}
export function useMilestoneObservations(query: MilestoneObservationQuery) {
  const { milestoneAdminService: service } = useServiceContainer();
  return useQuery({
    queryKey: [...keys.all, 'observations', query],
    queryFn: ({ signal }) => service.observations(query, signal),
    enabled: Boolean(query.child_id),
  });
}
export function useSaveMilestoneObservation() {
  const { milestoneAdminService: service } = useServiceContainer();
  return useMilestoneMutation(
    ({ input, id }: { input: MilestoneObservationInput; id?: string }) =>
      service.saveObservation(input, id),
  );
}
export function useDeleteMilestoneObservation() {
  const { milestoneAdminService: service } = useServiceContainer();
  return useMilestoneMutation((id: string) => service.deleteObservation(id));
}
