'use client';
import { useRef } from 'react';
import { ReactionButton } from '@/components/ui';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathPollStrings as copy } from '@/strings';
import type { PollComment } from '../models/pollComment';
import { usePollCommentReaction } from '../hooks';

export function PollCommentReaction({
  comment,
  writable,
}: {
  comment: PollComment;
  writable: boolean;
}) {
  const mutation = usePollCommentReaction();
  const busy = useRef(false);
  return (
    <div className="grid gap-2">
      <ReactionButton
        liked={comment.liked}
        label={comment.liked ? copy.unlike : copy.like}
        count={comment.likesCount}
        countLabel={copy.likes(comment.likesCount)}
        loading={mutation.isPending}
        disabled={!writable}
        onClick={async () => {
          if (busy.current || !writable) return;
          busy.current = true;
          try {
            await mutation.mutateAsync({
              id: comment.id,
              liked: !comment.liked,
            });
          } catch {
            /* Inline recovery. */
          } finally {
            busy.current = false;
          }
        }}
      />
      <MutationError error={mutation.error} />
    </div>
  );
}
