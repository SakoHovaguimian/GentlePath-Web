import { Button, Card, IconMenu, UiIcon } from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import {
  gentlePathPollStrings as copy,
  gentlePathCommunityStrings as communityCopy,
} from '@/strings';
import type { PollComment } from '../models/pollComment';
import { PollIdentity } from './PollIdentity';
import { PollCommentReaction } from './PollCommentReaction';

export function PollCommentCard({
  comment,
  writable,
  busy,
  onEdit,
  onDelete,
  onReply,
}: {
  comment: PollComment;
  writable: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReply?: () => void;
}) {
  const { session } = useSessionState();
  const own = comment.userId === session?.user.id;
  return (
    <Card className="gp-community-comment">
      <div className="gp-community-post__header">
        <PollIdentity
          author={comment.author}
          createdAt={comment.createdAt}
          updatedAt={comment.updatedAt}
          own={own}
        />
        {own && (
          <IconMenu
            label={copy.commentActions}
            items={[
              {
                id: 'edit',
                icon: 'file',
                label: copy.editComment,
                disabled: !writable || busy,
              },
              {
                id: 'delete',
                icon: 'trash',
                label: copy.deleteComment,
                variant: 'destructive',
                disabled: !writable || busy,
              },
            ]}
            onAction={(action) => {
              if (action === 'edit') onEdit();
              else onDelete();
            }}
          />
        )}
      </div>
      <p className="gp-poll-body">{comment.body}</p>
      <div className="gp-community-post__footer">
        <PollCommentReaction comment={comment} writable={writable} />
        {onReply && !comment.parentCommentId && (
          <Button
            variant="ghost"
            disabled={!writable || busy}
            onClick={onReply}
          >
            <UiIcon name="chat" className="size-4" />
            {communityCopy.reply}
          </Button>
        )}
      </div>
    </Card>
  );
}
