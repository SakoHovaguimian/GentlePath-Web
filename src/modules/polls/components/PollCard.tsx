import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import { CommunityAttachments } from '@/modules/community/components/CommunityAttachments';
import { Badge, Button, Card, UiIcon } from '@/components/ui';
import { NavigationLink } from '@/components/ui/components/NavigationLink';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { useGuardedNavigate } from '@/providers/useGuardedNavigate';
import { gentlePathPollStrings as copy } from '@/strings';
import type { Poll } from '../models/poll';
import { PollIdentity } from './PollIdentity';
import { PollVote } from './PollVote';
import { PollMenu } from './PollMenu';
import { usePollExpired } from '../usePollExpired';

export function PollCard({
  poll,
  returnTo,
  own,
  writable,
  busy,
  onEdit,
  onDelete,
  onTag,
}: {
  poll: Poll;
  returnTo: string;
  own: boolean;
  writable: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTag: (tag: string) => void;
}) {
  const { confirmNavigation } = useNavigationGuard();
  const navigate = useGuardedNavigate();
  const href = `/polls/${encodeURIComponent(poll.id)}?returnTo=${encodeURIComponent(returnTo)}`;
  const expired = usePollExpired(poll);
  return (
    <Card className="gp-poll-card">
      <div className="gp-community-post__header">
        <PollIdentity
          author={poll.author}
          createdAt={poll.createdAt}
          updatedAt={poll.updatedAt}
          own={own}
        />
        <PollMenu
          contentId={poll.id}
          own={own}
          writable={writable}
          busy={busy}
          onOpen={() => navigate(href)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge intent={poll.selectionMode === 'MULTIPLE' ? 'purple' : 'brand'}>
          {copy.modes[poll.selectionMode]}
        </Badge>
        {expired && <Badge intent="warning">{copy.expired}</Badge>}
      </div>
      <h2 className="m-0 font-display text-xl font-normal text-primary wrap-anywhere sm:text-2xl">
        <NavigationLink
          className="gp-poll-question-link"
          href={href}
          beforeNavigate={confirmNavigation}
        >
          {poll.title}
        </NavigationLink>
      </h2>
      <p className="gp-poll-body line-clamp-3">{poll.message}</p>
      <CommunityAttachments items={poll.attachments} />
      <PollVote poll={poll} writable={writable} compact />
      {poll.tags.length > 0 && (
        <div className="gp-poll-card__controls flex flex-wrap gap-2">
          {poll.tags.map((tag) => (
            <Button
              key={tag}
              variant="ghost"
              className="min-h-9 px-3"
              onClick={() => onTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}
      <div className="gp-poll-card__controls flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-secondary pt-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-tertiary">
          <Button asChild variant="ghost">
            <NavigationLink href={href} beforeNavigate={confirmNavigation}>
              <UiIcon name="chat" className="size-4" />
              {copy.comments(poll.commentsCount)}
            </NavigationLink>
          </Button>
        </div>
        <SavedContentButton
          contentType="POLL"
          contentId={poll.id}
          variant="ghost"
        />
      </div>
    </Card>
  );
}
