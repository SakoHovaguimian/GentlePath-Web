'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { BookmarkButton, Button, ReactionButton } from '@/components/ui';
import { createQueryClient } from '@/lib/client/queryClient';
import { createPublicEngagementService } from '@/publicClientContainer';
import { DomainError } from '@/errors/domainErrors';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathEngagementStrings as copy } from '@/strings';
import { engagementQueryKeys as keys } from '../queryKeys';

/** The public reader stays independent of the protected session provider. */
export function BlogEngagementControls({
  articleId,
  slug,
}: {
  articleId: string;
  slug: string;
}) {
  const [client] = useState(createQueryClient);
  const [service] = useState(createPublicEngagementService);
  return (
    <QueryClientProvider client={client}>
      <ArticleActions articleId={articleId} slug={slug} service={service} />
    </QueryClientProvider>
  );
}

function ArticleActions({
  articleId,
  slug,
  service,
}: {
  articleId: string;
  slug: string;
  service: ReturnType<typeof createPublicEngagementService>;
}) {
  const cache = useQueryClient();
  const query = useQuery({
    queryKey: keys.blog(articleId),
    queryFn: ({ signal }) => service.blog(articleId, signal),
    retry: false,
  });
  const like = useMutation({
    mutationFn: (liked: boolean) => service.likeBlog(articleId, liked),
    onSuccess: (data) => cache.setQueryData(keys.blog(articleId), data),
  });
  const save = useMutation({
    mutationFn: (saved: boolean) => service.setSaved('BLOG', articleId, saved),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: keys.blog(articleId) });
    },
  });
  const error = query.error ?? like.error ?? save.error;
  const signIn = error instanceof DomainError && error.status === 401;
  const busy = like.isPending || save.isPending;
  if (signIn)
    return (
      <section
        aria-label={copy.articleActionsLabel}
        className="my-6 grid gap-3 rounded-xl border border-secondary bg-secondary_subtle p-4 sm:p-6"
      >
        <p className="m-0 text-sm text-secondary">{copy.signInDescription}</p>
        <Button asChild variant="secondary" className="justify-self-start">
          <Link
            href={
              `/login?redirectTo=${encodeURIComponent(`/blog/${slug}`)}` as Route
            }
          >
            {copy.signIn}
          </Link>
        </Button>
      </section>
    );
  return (
    <section
      aria-label={copy.articleActionsLabel}
      className="my-6 grid min-h-20 gap-3 rounded-xl border border-secondary bg-secondary_subtle p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <ReactionButton
          liked={query.data?.liked ?? false}
          label={query.data?.liked ? copy.unlike : copy.like}
          loading={query.isPending || like.isPending}
          disabled={!query.data || (busy && !like.isPending)}
          onClick={async () => {
            if (!query.data || busy) return;
            try {
              await like.mutateAsync(!query.data.liked);
            } catch {
              /* Inline recovery. */
            }
          }}
        />
        <span
          role="status"
          aria-live="polite"
          className="text-sm tabular-nums text-secondary"
        >
          {query.data ? copy.likesLabel(query.data.likesCount) : null}
        </span>
        <BookmarkButton
          saved={query.data?.saved ?? false}
          loading={query.isPending || save.isPending}
          disabled={!query.data || (busy && !save.isPending)}
          aria-pressed={query.data?.saved ?? false}
          onClick={async () => {
            if (!query.data || busy) return;
            try {
              await save.mutateAsync(!query.data.saved);
            } catch {
              /* Inline recovery. */
            }
          }}
        />
        {query.isError && (
          <Button variant="secondary" onClick={() => void query.refetch()}>
            {copy.retry}
          </Button>
        )}
      </div>
      <MutationError error={error} />
    </section>
  );
}
