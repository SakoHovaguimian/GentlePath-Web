'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer, useSessionState } from '@/providers/AppProviders';
import { portalQueryKeys } from '@/modules/portal/queryKeys';
import type { ApplicationQuery } from './models/applicationQuery';
import type {
  ServiceApplicationCreate,
  ServiceApplicationUpdate,
} from './models/serviceApplication';
import type {
  ApplicationFollowUpCreate,
  ApplicationFollowUpUpdate,
  ApplicationFollowUpCompletion,
} from './models/applicationFollowUp';

export const applicationQueryKeys = {
  all: ['portal', 'applications'] as const,
  list: (query: ApplicationQuery, userId?: string) =>
    ['portal', 'applications', userId, 'list', query] as const,
  detail: (id: string, userId?: string) =>
    ['portal', 'applications', userId, 'detail', id] as const,
  priority: (limit: number, offset: number, userId?: string) =>
    ['portal', 'applications', userId, 'priority', limit, offset] as const,
  dashboard: (limit: number, userId?: string) =>
    ['portal', 'applications', userId, 'dashboard', limit] as const,
};

export function useApplicationDashboard(limit = 6) {
  const { session } = useSessionState();
  const userId = session?.user.id;
  const { applicationService } = useServiceContainer();
  return useQuery({
    enabled: Boolean(userId),
    refetchInterval: 60_000,
    queryKey: applicationQueryKeys.dashboard(limit, userId),
    queryFn: ({ signal }) => applicationService.dashboard(limit, signal),
  });
}

export function useApplications(query: ApplicationQuery) {
  const { session } = useSessionState();
  const userId = session?.user.id;
  const { applicationService } = useServiceContainer();
  return useQuery({
    enabled: Boolean(userId),
    queryKey: applicationQueryKeys.list(query, userId),
    queryFn: ({ signal }) => applicationService.list(query, signal),
  });
}

export function useApplication(id: string) {
  const { session } = useSessionState();
  const userId = session?.user.id;
  const { applicationService } = useServiceContainer();
  return useQuery({
    refetchInterval: 60_000,
    enabled: Boolean(userId),
    queryKey: applicationQueryKeys.detail(id, userId),
    queryFn: ({ signal }) => applicationService.get(id, signal),
  });
}

export function usePriorityFollowUps(limit = 3, offset = 0) {
  const { session } = useSessionState();
  const userId = session?.user.id;
  const { applicationService } = useServiceContainer();
  return useQuery({
    refetchInterval: 60_000,
    enabled: Boolean(userId),
    queryKey: applicationQueryKeys.priority(limit, offset, userId),
    queryFn: ({ signal }) => applicationService.priority(limit, offset, signal),
  });
}

export function useApplicationMutations() {
  const { applicationService: service } = useServiceContainer();
  const cache = useQueryClient();
  const invalidate = async () => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: applicationQueryKeys.all }),
      cache.invalidateQueries({ queryKey: portalQueryKeys.overview }),
    ]);
  };
  const create = useMutation({
    mutationFn: (input: ServiceApplicationCreate) => service.create(input),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: ServiceApplicationUpdate;
    }) => service.update(id, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => service.remove(id),
    onSuccess: invalidate,
  });
  const createFollowUp = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: ApplicationFollowUpCreate;
    }) => service.createFollowUp(id, input),
    onSuccess: invalidate,
  });
  const updateFollowUp = useMutation({
    mutationFn: ({
      id,
      followUpId,
      input,
    }: {
      id: string;
      followUpId: string;
      input: ApplicationFollowUpUpdate;
    }) => service.updateFollowUp(id, followUpId, input),
    onSuccess: invalidate,
  });
  const completeFollowUp = useMutation({
    mutationFn: ({
      id,
      followUpId,
      input,
    }: {
      id: string;
      followUpId: string;
      input: ApplicationFollowUpCompletion;
    }) => service.completeFollowUp(id, followUpId, input),
    onSuccess: invalidate,
  });
  const deleteFollowUp = useMutation({
    mutationFn: ({ id, followUpId }: { id: string; followUpId: string }) =>
      service.deleteFollowUp(id, followUpId),
    onSuccess: invalidate,
  });
  return {
    create,
    update,
    remove,
    createFollowUp,
    updateFollowUp,
    completeFollowUp,
    deleteFollowUp,
  };
}
