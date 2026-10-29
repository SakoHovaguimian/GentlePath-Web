import { Badge, Button, Card, UiIcon } from '@/components/ui';
import { NavigationLink } from '@/components/ui/components/NavigationLink';
import { gentlePathPollStrings as copy } from '@/strings';
import type { Poll } from '../models/poll';
import { PollIdentity } from './PollIdentity';
import { PollPreview } from './PollPreview';

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
  return (
    <Card className="gp-poll-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge intent={poll.selectionMode === 'MULTIPLE' ? 'purple' : 'brand'}>
          {copy.modes[poll.selectionMode]}
        </Badge>
        <PollIdentity author={poll.author} createdAt={poll.createdAt} />
      </div>
      <h2 className="m-0 font-display text-xl font-normal text-primary wrap-anywhere sm:text-2xl">
        <NavigationLink
          className="gp-poll-question-link"
          href={`/polls/${poll.id}?returnTo=${encodeURIComponent(returnTo)}`}
        >
          {poll.title}
        </NavigationLink>
      </h2>
      <p className="gp-poll-body line-clamp-3">{poll.message}</p>
      <PollPreview poll={poll} />
      {poll.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-secondary pt-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-tertiary">
          <span className="inline-flex items-center gap-2">
            <UiIcon name="chart" className="size-4" />
            {copy.participants(poll.participantsCount)}
          </span>
          <span>{copy.comments(poll.commentsCount)}</span>
        </div>
        {own && (
          <div className="flex flex-wrap gap-1">
            <Button
              variant="ghost"
              disabled={!writable || busy}
              onClick={onEdit}
            >
              {copy.editPoll}
            </Button>
            <Button
              variant="ghost"
              aria-label={copy.deletePoll}
              disabled={!writable || busy}
              onClick={onDelete}
            >
              <UiIcon name="trash" className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
