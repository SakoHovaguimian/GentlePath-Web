import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import { CommunityAttachments } from './CommunityAttachments';
import { Badge, Button, Card, NavigationLink, UiIcon } from '@/components/ui';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { gentlePathCommunityStrings as copy } from '@/strings';
import type { CommunityPost } from '../models/communityPost';
import { CommunityIdentity } from './CommunityIdentity';
import { CommunityReactionButton } from './CommunityReactionButton';
import { CommunityPostMenu } from './CommunityPostMenu';

interface CommunityPostCardProps {
  post: CommunityPost;
  own: boolean;
  writable: boolean;
  busy: boolean;
  returnTo: string;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onHide: () => void;
}
export function CommunityPostCard({
  post,
  own,
  writable,
  busy,
  returnTo,
  onEdit,
  onDelete,
  onReport,
  onHide,
}: CommunityPostCardProps) {
  const { confirmNavigation } = useNavigationGuard();
  const href = `/community/${encodeURIComponent(post.id)}?returnTo=${encodeURIComponent(returnTo)}`;
  return (
    <Card className="gp-community-post gp-community-post--linked">
      <div className="gp-community-post__header">
        <CommunityIdentity
          author={post.author}
          createdAt={post.createdAt}
          updatedAt={post.updatedAt}
          own={own}
        />
        <div className="gp-community-post__control">
          <CommunityPostMenu
            contentId={post.id}
            own={own}
            writable={writable}
            busy={busy}
            onHide={onHide}
            onReport={onReport}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
      <div className="gp-community-post__copy">
        <h2>
          <NavigationLink
            className="gp-community-post__link"
            href={href}
            beforeNavigate={confirmNavigation}
          >
            {post.title}
          </NavigationLink>
        </h2>
        <p className="gp-community-post__excerpt">{post.body}</p>
      </div>
      <div className="gp-community-post__control">
        <CommunityAttachments items={post.attachments} />
      </div>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 5).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}
      <div className="gp-community-post__footer gp-community-post__control">
        <div className="flex flex-wrap items-center gap-2">
          <CommunityReactionButton
            id={post.id}
            targetType="post"
            liked={post.liked}
            count={post.likeCount}
            disabled={!writable}
          />
          <Button asChild variant="ghost">
            <NavigationLink href={href} beforeNavigate={confirmNavigation}>
              <UiIcon name="chat" className="size-4" />
              {copy.commentsCount(post.commentCount)}
            </NavigationLink>
          </Button>
        </div>
        <SavedContentButton
          contentType="POST"
          contentId={post.id}
          variant="ghost"
        />
      </div>
    </Card>
  );
}
