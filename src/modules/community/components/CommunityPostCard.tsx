import { Badge, Button, Card, NavigationLink, UiIcon } from '@/components/ui';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { gentlePathCommunityStrings as copy } from '@/strings';
import type { CommunityPost } from '../models/communityPost';
import { CommunityIdentity } from './CommunityIdentity';
import { CommunityReactionButton } from './CommunityReactionButton';

interface CommunityPostCardProps {
  post: CommunityPost;
  own: boolean;
  writable: boolean;
  busy: boolean;
  returnTo: string;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
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
}: CommunityPostCardProps) {
  const { confirmNavigation } = useNavigationGuard();
  const href = `/community/${encodeURIComponent(post.id)}?returnTo=${encodeURIComponent(returnTo)}`;
  return (
    <Card className="gp-community-post">
      <CommunityIdentity
        author={post.author}
        createdAt={post.createdAt}
        updatedAt={post.updatedAt}
        own={own}
      />
      <div className="gp-community-post__copy">
        <h2>
          <NavigationLink href={href} beforeNavigate={confirmNavigation}>
            {post.title}
          </NavigationLink>
        </h2>
        <p className="gp-community-post__excerpt">{post.body}</p>
      </div>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 5).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}
      <div className="gp-community-post__footer">
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
        <div className="flex flex-wrap gap-1">
          {own && (
            <>
              <Button
                variant="ghost"
                disabled={!writable || busy}
                onClick={onEdit}
              >
                {copy.edit}
              </Button>
              <Button
                variant="destructive"
                disabled={!writable || busy}
                onClick={onDelete}
                aria-label={copy.deletePost}
              >
                <UiIcon name="trash" className="size-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" disabled={!writable} onClick={onReport}>
            {copy.report}
          </Button>
        </div>
      </div>
    </Card>
  );
}
