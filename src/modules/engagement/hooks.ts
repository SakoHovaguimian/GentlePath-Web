'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer } from '@/providers/AppProviders';
import { portalQueryKeys } from '@/modules/portal/queryKeys';
import type { SavedContentQuery } from './models/savedContentQuery';
import type { SavedContentType } from './models/savedContentType';
import type { ResourceRatingInput } from './models/resourceEngagement';
import { engagementQueryKeys as keys } from './queryKeys';
export function useSavedContent(query: Partial<SavedContentQuery>) {
  const { engagementService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.saved(query),
    queryFn: ({ signal }) => service.savedContent(query, signal),
  });
}
export function useSavedItem(id: string) {
  const { engagementService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.savedItem(id),
    queryFn: ({ signal }) => service.savedItem(id, signal),
  });
}
export function useSavedContentState(type: SavedContentType, id: string) {
  const { engagementService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.savedState(type, id),
    queryFn: ({ signal }) => service.savedState(type, id, signal),
  });
}
export function useSetSavedContent() {
  const { engagementService: service } = useServiceContainer();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      contentType,
      contentId,
      saved,
    }: {
      contentType: SavedContentType;
      contentId: string;
      saved: boolean;
    }) => service.setSaved(contentType, contentId, saved),
    onSuccess: async () => {
      await Promise.all([
        cache.invalidateQueries({ queryKey: keys.all }),
        cache.invalidateQueries({ queryKey: portalQueryKeys.all }),
      ]);
    },
  });
}
export function useResourceEngagement(id: string) {
  const { engagementService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.resource(id),
    queryFn: ({ signal }) => service.resource(id, signal),
  });
}
export function useRateResource(id: string) {
  const { engagementService: service } = useServiceContainer();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: ResourceRatingInput | null) =>
      service.rateResource(id, input),
    onSuccess: async (data) => {
      cache.setQueryData(keys.resource(id), data);
      await cache.invalidateQueries({ queryKey: portalQueryKeys.resources });
    },
  });
}
