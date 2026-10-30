import { Button, Card, IconMenu, UiIcon } from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { gentlePathCommunityStrings as copy } from '@/strings';
import type { CommunityComment } from '../models/communityComment';
import { CommunityIdentity } from './CommunityIdentity';
import { CommunityReactionButton } from './CommunityReactionButton';

export function CommunityCommentCard({
  comment,
  writable,
  busy,
  onEdit,
  onDelete,
  onReport,
  onReply,
}: {
  comment: CommunityComment;
  writable: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onReply?: () => void;
}) {
  const { session } = useSessionState();
  const own = comment.userId === session?.user.id;
  return (
    <Card className="gp-community-comment">
      <div className="gp-community-post__header">
        <CommunityIdentity
          author={comment.author}
          createdAt={comment.createdAt}
          updatedAt={comment.updatedAt}
          own={own}
        />
        <IconMenu
          label={copy.commentActions}
          items={[
            {
              id: 'report',
              icon: 'warning',
              label: copy.reportComment,
              disabled: !writable,
            },
            ...(own
              ? [
                  {
                    id: 'edit',
                    icon: 'file' as const,
                    label: copy.editComment,
                    disabled: !writable || busy,
                  },
                  {
                    id: 'delete',
                    icon: 'trash' as const,
                    label: copy.deleteComment,
                    variant: 'destructive' as const,
                    disabled: !writable || busy,
                  },
                ]
              : []),
          ]}
          onAction={(action) => {
            if (action === 'edit') onEdit();
            else if (action === 'delete') onDelete();
            else onReport();
          }}
        />
      </div>
      <p className="gp-community-body">{comment.body}</p>
      <div className="gp-community-post__footer">
        <CommunityReactionButton
          id={comment.id}
          targetType="post_comment"
          liked={comment.liked}
          count={comment.likeCount}
          disabled={!writable}
        />
        {onReply && !comment.parentCommentId && (
          <Button
            variant="ghost"
            disabled={!writable || busy}
            onClick={onReply}
          >
            <UiIcon name="chat" className="size-4" />
            {copy.reply}
          </Button>
        )}
      </div>
    </Card>
  );
}
