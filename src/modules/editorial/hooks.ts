'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer } from '@/providers/AppProviders';
import { portalQueryKeys, adminQueryKeys } from '@/modules/portal/queryKeys';
import { editorialQueryKeys as keys } from './queryKeys';
import type { GuideInput } from './models/guide';
import type { EditorialResourceInput } from './models/editorialResource';
import type { EditorialQuery } from './models/editorialQuery';

export function useGuides(query: EditorialQuery) {
  const { editorialService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.guides(query),
    queryFn: ({ signal }) => service.guides(query, signal),
  });
}
export function useGuide(id?: string) {
  const { editorialService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.guide(id),
    queryFn: ({ signal }) => service.guide(id!, signal),
    enabled: Boolean(id),
  });
}
export function useEditorialResources(query: EditorialQuery) {
  const { editorialService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.resources(query),
    queryFn: ({ signal }) => service.resources(query, signal),
  });
}
export function useEditorialResource(id?: string) {
  const { editorialService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.resource(id),
    queryFn: ({ signal }) => service.resource(id!, signal),
    enabled: Boolean(id),
  });
}
export function useEditorialCollections() {
  const { editorialService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.collections,
    queryFn: ({ signal }) => service.collections(signal),
  });
}
export function useEditorialMutations() {
  const { editorialService: service } = useServiceContainer();
  const cache = useQueryClient();
  const refresh = () => {
    void cache.invalidateQueries({ queryKey: keys.all });
    void cache.invalidateQueries({ queryKey: portalQueryKeys.all });
    void cache.invalidateQueries({ queryKey: adminQueryKeys.all });
    void cache.invalidateQueries({ queryKey: ['gentlepath', 'engagement'] });
  };
  const saveGuide = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: GuideInput }) =>
      service.saveGuide(input, id),
    onSuccess: refresh,
  });
  const deleteGuide = useMutation({
    mutationFn: (id: string) => service.deleteGuide(id),
    onSuccess: refresh,
  });
  const saveResource = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string;
      input: EditorialResourceInput;
    }) => service.saveResource(input, id),
    onSuccess: refresh,
  });
  const deleteResource = useMutation({
    mutationFn: (id: string) => service.deleteResource(id),
    onSuccess: refresh,
  });
  return {
    saveGuide,
    deleteGuide,
    saveResource,
    deleteResource,
    isPending:
      saveGuide.isPending ||
      deleteGuide.isPending ||
      saveResource.isPending ||
      deleteResource.isPending,
  };
}
