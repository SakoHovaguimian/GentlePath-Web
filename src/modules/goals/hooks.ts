'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer, useSessionState } from '@/providers/AppProviders';
import type { GoalInput } from './models/goal';
import type { GoalQuery } from './models/goalQuery';
import type { GoalStatus } from './models/goalStatus';
import type { GoalNoteInput } from './models/goalNote';

export const goalQueryKeys = {
  all: ['portal', 'goals'] as const,
  list: (query: GoalQuery, userId?: string) =>
    ['portal', 'goals', userId, 'list', query] as const,
  detail: (id: string, userId?: string) =>
    ['portal', 'goals', userId, 'detail', id] as const,
};
export function useGoals(query: GoalQuery) {
  const { session } = useSessionState();
  const { goalService } = useServiceContainer();
  return useQuery({
    queryKey: goalQueryKeys.list(query, session?.user.id),
    enabled: Boolean(session?.user.id),
    queryFn: ({ signal }) => goalService.list(query, signal),
  });
}
export function useGoal(id: string) {
  const { session } = useSessionState();
  const { goalService } = useServiceContainer();
  return useQuery({
    queryKey: goalQueryKeys.detail(id, session?.user.id),
    queryFn: ({ signal }) => goalService.get(id, signal),
    enabled: Boolean(id && session?.user.id),
  });
}
export function useGoalActions() {
  const { goalService } = useServiceContainer();
  const cache = useQueryClient();
  const invalidate = () =>
    cache.invalidateQueries({ queryKey: goalQueryKeys.all });
  return {
    save: useMutation({
      mutationFn: ({ input, id }: { input: GoalInput; id?: string }) =>
        goalService.save(input, id),
      onSuccess: invalidate,
    }),
    status: useMutation({
      mutationFn: ({ id, status }: { id: string; status: GoalStatus }) =>
        goalService.status(id, status),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => goalService.remove(id),
      onSuccess: invalidate,
    }),
    saveNote: useMutation({
      mutationFn: ({
        id,
        input,
        noteId,
      }: {
        id: string;
        input: GoalNoteInput;
        noteId?: string;
      }) => goalService.saveNote(id, input, noteId),
      onSuccess: invalidate,
    }),
    removeNote: useMutation({
      mutationFn: ({ id, noteId }: { id: string; noteId: string }) =>
        goalService.removeNote(id, noteId),
      onSuccess: invalidate,
    }),
    download: useMutation({
      mutationFn: ({
        id,
        mediaId,
        download,
      }: {
        id: string;
        mediaId: string;
        download?: boolean;
      }) => goalService.download(id, mediaId, download),
      retry: false,
    }),
    upload: useMutation({
      mutationFn: ({
        file,
        childId,
        signal,
        progress,
      }: {
        file: File;
        childId: string;
        signal: AbortSignal;
        progress: (value: number) => void;
      }) => goalService.upload(file, childId, signal, progress),
      retry: false,
    }),
    cancelUpload: useMutation({
      mutationFn: (id: string) => goalService.cancelUpload(id),
      retry: false,
    }),
  };
}
export function useGoalMediaUrl(id: string, mediaId: string, enabled = true) {
  const { session } = useSessionState();
  const { goalService } = useServiceContainer();
  return useQuery({
    queryKey: [...goalQueryKeys.detail(id, session?.user.id), 'media', mediaId],
    queryFn: ({ signal }) => goalService.download(id, mediaId, false, signal),
    enabled: enabled && Boolean(id && mediaId && session?.user.id),
    staleTime: 0,
    gcTime: 0,
  });
}
