'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer } from '@/providers/AppProviders';
import type { BlogMutationInput } from './models/blogArticle';
import type { BlogQuery } from './models/blogQuery';
import { blogQueryKeys } from './queryKeys';
import { adminQueryKeys } from '@/modules/portal/queryKeys';

export function useBlogOptions() {
  const { blogService } = useServiceContainer();
  return useQuery({
    queryKey: blogQueryKeys.options,
    queryFn: ({ signal }) => blogService.options(false, signal),
  });
}
export function useBlogArticles(query: BlogQuery) {
  const { blogService } = useServiceContainer();
  return useQuery({
    queryKey: blogQueryKeys.list(query),
    queryFn: ({ signal }) => blogService.list(query, signal),
    staleTime: 15000,
  });
}
export function useBlogArticle(id?: string) {
  const { blogService } = useServiceContainer();
  return useQuery({
    queryKey: blogQueryKeys.detail(id),
    queryFn: ({ signal }) => blogService.get(id!, signal),
    enabled: Boolean(id),
  });
}
export function useBlogMutations() {
  const { blogService } = useServiceContainer();
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: blogQueryKeys.all });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
  };
  const save = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: BlogMutationInput }) =>
      id ? blogService.update(id, input) : blogService.create(input),
    onSuccess: refresh,
  });
  const publication = useMutation({
    mutationFn: ({
      id,
      revision,
      published,
    }: {
      id: string;
      revision: number;
      published: boolean;
    }) => blogService.setPublication(id, revision, published),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: ({ id, revision }: { id: string; revision: number }) =>
      blogService.delete(id, revision),
    onSuccess: refresh,
  });
  return {
    save,
    publication,
    remove,
    isPending: save.isPending || publication.isPending || remove.isPending,
  };
}
