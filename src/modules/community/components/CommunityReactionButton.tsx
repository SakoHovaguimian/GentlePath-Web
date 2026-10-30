import { useRef } from 'react';
import { ReactionButton } from '@/components/ui';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { MutationError } from '@/modules/portal/components/MutationError';
import { useCommunityReaction } from '../hooks';

interface CommunityReactionButtonProps {
  id: string;
  targetType: 'post' | 'post_comment';
  liked: boolean;
  count: number;
  disabled: boolean;
}
export function CommunityReactionButton({
  id,
  targetType,
  liked,
  count,
  disabled,
}: CommunityReactionButtonProps) {
  const mutation = useCommunityReaction();
  const busy = useRef(false);
  return (
    <div className="grid gap-2">
      <ReactionButton
        liked={liked}
        label={liked ? copy.liked : copy.like}
        count={count}
        loading={mutation.isPending}
        disabled={disabled}
        aria-label={copy.likeDescription(count, liked)}
        onClick={async () => {
          if (busy.current || disabled) return;
          busy.current = true;
          try {
            await mutation.mutateAsync({ id, targetType, liked: !liked });
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
