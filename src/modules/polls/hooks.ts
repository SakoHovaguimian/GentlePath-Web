'use client';

import type { CommunityCommentQuery } from '@/modules/community/models/communityCommentQuery';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer } from '@/providers/AppProviders';
import { engagementQueryKeys } from '@/modules/engagement/queryKeys';
import { portalQueryKeys } from '@/modules/portal/queryKeys';
import type { PollInput } from './models/poll';
import type { PollCommentInput } from './models/pollComment';
import type { PollQuery } from './models/pollQuery';
import { pollQueryKeys as keys } from './queryKeys';

export function usePollStatus() {
  const { pollService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.status,
    queryFn: ({ signal }) => service.status(signal),
  });
}
export function usePolls(query: PollQuery) {
  const { pollService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.list(query),
    queryFn: ({ signal }) => service.polls(query, signal),
  });
}
export function usePoll(id: string) {
  const { pollService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: ({ signal }) => service.poll(id, signal),
  });
}
export function usePollBallot(id: string) {
  const { pollService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.ballot(id),
    queryFn: ({ signal }) => service.ballot(id, signal),
  });
}
export function usePollComments(id: string, paging: CommunityCommentQuery) {
  const { pollService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.comments(id, paging),
    queryFn: ({ signal }) => service.comments(id, paging, signal),
  });
}
function usePollMutation<T, R>(mutationFn: (input: T) => Promise<R>) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        cache.invalidateQueries({ queryKey: keys.all }),
        cache.invalidateQueries({ queryKey: engagementQueryKeys.all }),
        cache.invalidateQueries({ queryKey: portalQueryKeys.overview }),
      ]);
    },
  });
}
export function useSavePoll() {
  const { pollService: service } = useServiceContainer();
  return usePollMutation(({ input, id }: { input: PollInput; id?: string }) =>
    service.savePoll(input, id),
  );
}
export function useDeletePoll() {
  const { pollService: service } = useServiceContainer();
  return usePollMutation((id: string) => service.deletePoll(id));
}
export function useVotePoll() {
  const { pollService: service } = useServiceContainer();
  return usePollMutation(
    ({ id, optionIds }: { id: string; optionIds: string[] }) =>
      service.vote(id, optionIds),
  );
}
export function useClearPollVote() {
  const { pollService: service } = useServiceContainer();
  return usePollMutation((id: string) => service.clearVote(id));
}
export function useSavePollComment() {
  const { pollService: service } = useServiceContainer();
  return usePollMutation(
    ({
      pollId,
      input,
      id,
    }: {
      pollId: string;
      input: PollCommentInput;
      id?: string;
    }) => service.saveComment(pollId, input, id),
  );
}
export function useDeletePollComment() {
  const { pollService: service } = useServiceContainer();
  return usePollMutation((id: string) => service.deleteComment(id));
}
export function usePollCommentReaction() {
  const { pollService: service } = useServiceContainer();
  return usePollMutation(({ id, liked }: { id: string; liked: boolean }) =>
    service.react(id, liked),
  );
}
