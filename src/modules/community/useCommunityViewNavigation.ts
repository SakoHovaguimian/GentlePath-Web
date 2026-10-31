'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useServiceContainer } from '@/providers/AppProviders';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { communityQueryKeys } from './queryKeys';
import { pollQueryKeys } from '@/modules/polls/queryKeys';
import { PollQuerySchema } from '@/modules/polls/models/pollQuery';
import { CommunityPostQuerySchema } from './models/communityPostQuery';
import type { CommunityView } from './models/communityView';

/** Resolve the destination's content before replacing the currently readable view. */
export function useCommunityViewNavigation() {
  const cache = useQueryClient();
  const { communityService, pollService } = useServiceContainer();
  const { confirmNavigation } = useNavigationGuard();
  const router = useRouter();
  const [preparing, setPreparing] = useState(false);
  const [navigating, startTransition] = useTransition();
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function choose(view: CommunityView) {
    if (controller.current || !(await confirmNavigation())) return;
    if (controller.current) return;
    const current = new AbortController();
    controller.current = current;
    setPreparing(true);
    const href = view === 'polls' ? '/polls' : '/community';
    router.prefetch(href);
    try {
      if (view === 'polls') {
        const query = PollQuerySchema.parse({});
        const [page] = await Promise.all([
          cache.fetchQuery({
            queryKey: pollQueryKeys.list(query),
            queryFn: ({ signal }) =>
              pollService.polls(
                query,
                AbortSignal.any([signal, current.signal]),
              ),
          }),
          cache.fetchQuery({
            queryKey: pollQueryKeys.status,
            queryFn: ({ signal }) =>
              pollService.status(AbortSignal.any([signal, current.signal])),
          }),
        ]);
        await Promise.all(
          page.data.map((poll) =>
            cache.fetchQuery({
              queryKey: pollQueryKeys.ballot(poll.id),
              queryFn: ({ signal }) =>
                pollService.ballot(
                  poll.id,
                  AbortSignal.any([signal, current.signal]),
                ),
            }),
          ),
        );
      } else {
        const query = CommunityPostQuerySchema.parse({ limit: 9 });
        await Promise.all([
          cache.fetchQuery({
            queryKey: communityQueryKeys.posts(query),
            queryFn: ({ signal }) =>
              communityService.posts(
                query,
                AbortSignal.any([signal, current.signal]),
              ),
          }),
          cache.fetchQuery({
            queryKey: communityQueryKeys.status,
            queryFn: ({ signal }) =>
              communityService.status(
                AbortSignal.any([signal, current.signal]),
              ),
          }),
        ]);
      }
    } catch {
      // The destination's normal query boundary owns read errors and retry.
    } finally {
      if (!current.signal.aborted) {
        startTransition(() => router.push(href));
        setPreparing(false);
        controller.current = null;
      }
    }
  }
  return { choose, pending: preparing || navigating };
}
