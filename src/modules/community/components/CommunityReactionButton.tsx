import { Button, UiIcon } from '@/components/ui';
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
  return (
    <div className="grid gap-2">
      <Button
        variant={liked ? 'secondary' : 'ghost'}
        className="justify-self-start"
        loading={mutation.isPending}
        disabled={disabled}
        aria-pressed={liked}
        aria-label={copy.likeDescription(count, liked)}
        onClick={async () => {
          if (mutation.isPending) return;
          try {
            await mutation.mutateAsync({ id, targetType, liked: !liked });
          } catch {
            /* Inline recovery. */
          }
        }}
      >
        <UiIcon name={liked ? 'check' : 'plus'} className="size-4" />
        {liked ? copy.unlike : copy.like}
        <span className="text-xs tabular-nums">{count}</span>
      </Button>
      <MutationError error={mutation.error} />
    </div>
  );
}
