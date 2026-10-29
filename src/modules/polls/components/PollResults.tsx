import { Badge, PageSection } from '@/components/ui';
import { gentlePathPollStrings as copy } from '@/strings';
import type { Poll } from '../models/poll';

export function PollResults({
  poll,
  selectedIds = [],
}: {
  poll: Poll;
  selectedIds?: string[];
}) {
  return (
    <PageSection
      id="poll-results"
      title={copy.resultsTitle}
      description={copy.resultsHint}
      action={
        <Badge intent="brand">
          {copy.participants(poll.participantsCount)}
        </Badge>
      }
    >
      <div className="grid gap-5">
        {poll.options.map((option) => {
          const percent = poll.participantsCount
            ? Math.round(
                (option.selectionsCount / poll.participantsCount) * 100,
              )
            : 0;
          return (
            <div key={option.id} className="grid gap-2">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <span className="min-w-0 flex-1 basis-44 text-sm text-primary wrap-anywhere">
                  {option.text}
                </span>
                {selectedIds.includes(option.id) && (
                  <Badge>{copy.selected}</Badge>
                )}
                <span className="text-sm text-secondary tabular-nums">
                  {copy.resultCount(option.selectionsCount, percent)}
                </span>
              </div>
              <div
                role="meter"
                aria-label={option.text}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="gp-poll-result-track"
              >
                <div
                  className="gp-poll-result-fill"
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {poll.participantsCount === 0 && (
        <p className="m-0 text-sm text-tertiary">{copy.noVotesHint}</p>
      )}
    </PageSection>
  );
}
