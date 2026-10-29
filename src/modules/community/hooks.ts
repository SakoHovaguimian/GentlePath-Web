'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer } from '@/providers/AppProviders';
import { adminQueryKeys } from '@/modules/portal/queryKeys';
import type { CommunityPostInput } from './models/communityPost';
import type { CommunityCommentInput } from './models/communityComment';
import type { CommunityReportInput } from './models/communityReport';
import type { CommunityPaging } from './models/communityPaging';
import type { CommunityPostQuery } from './models/communityPostQuery';
import type { CommunityReportQuery } from './models/communityReportQuery';
import { communityQueryKeys as keys } from './queryKeys';

export function useCommunityStatus() {
  const { communityService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.status,
    queryFn: ({ signal }) => service.status(signal),
  });
}
export function useCommunityPosts(query: CommunityPostQuery) {
  const { communityService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.posts(query),
    queryFn: ({ signal }) => service.posts(query, signal),
  });
}
export function useCommunityPost(id: string) {
  const { communityService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.post(id),
    queryFn: ({ signal }) => service.post(id, signal),
  });
}
export function useCommunityComments(id: string, paging: CommunityPaging) {
  const { communityService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.comments(id, paging),
    queryFn: ({ signal }) => service.comments(id, paging, signal),
  });
}
export function useCommunityReports(query: CommunityReportQuery) {
  const { communityService: service } = useServiceContainer();
  return useQuery({
    queryKey: keys.reports(query),
    queryFn: ({ signal }) => service.reports(query, signal),
  });
}
function useCommunityMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        cache.invalidateQueries({ queryKey: keys.all }),
        cache.invalidateQueries({ queryKey: adminQueryKeys.reports }),
        cache.invalidateQueries({ queryKey: adminQueryKeys.overview }),
      ]);
    },
  });
}
export function useSaveCommunityPost() {
  const { communityService: service } = useServiceContainer();
  return useCommunityMutation(
    ({ input, id }: { input: CommunityPostInput; id?: string }) =>
      service.savePost(input, id),
  );
}
export function useDeleteCommunityPost() {
  const { communityService: service } = useServiceContainer();
  return useCommunityMutation((id: string) => service.deletePost(id));
}
export function useSaveCommunityComment() {
  const { communityService: service } = useServiceContainer();
  return useCommunityMutation(
    ({
      postId,
      input,
      id,
    }: {
      postId: string;
      input: CommunityCommentInput;
      id?: string;
    }) => service.saveComment(postId, input, id),
  );
}
export function useDeleteCommunityComment() {
  const { communityService: service } = useServiceContainer();
  return useCommunityMutation((id: string) => service.deleteComment(id));
}
export function useCommunityReaction() {
  const { communityService: service } = useServiceContainer();
  return useCommunityMutation(
    ({
      targetType,
      id,
      liked,
    }: {
      targetType: 'post' | 'post_comment';
      id: string;
      liked: boolean;
    }) => service.react(targetType, id, liked),
  );
}
export function useSubmitCommunityReport() {
  const { communityService: service } = useServiceContainer();
  return useCommunityMutation((input: CommunityReportInput) =>
    service.report(input),
  );
}
