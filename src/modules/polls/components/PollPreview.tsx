import { Badge } from '@/components/ui';
import { gentlePathPollStrings as copy } from '@/strings';
import type { Poll } from '../models/poll';

export function PollPreview({ poll }: { poll: Poll }) {
  const choices = [...poll.options]
    .sort((a, b) => b.selectionsCount - a.selectionsCount || a.position - b.position)
    .slice(0, 2);
  const voted = choices.some((choice) => choice.selectionsCount > 0);
  const remaining = poll.options.length - choices.length;
  return (
    <section className="grid min-w-0 gap-3 rounded-lg border border-secondary bg-secondary_subtle p-4">
      <h3 className="m-0 text-sm font-semibold text-primary">
        {voted ? copy.leadingOptionsTitle : copy.optionsTitle}
      </h3>
      <ul className="m-0 grid list-none gap-3 p-0">
        {choices.map((choice) => (
          <li key={choice.id} className="flex min-w-0 items-start justify-between gap-3">
            <span className="min-w-0 text-sm text-primary wrap-anywhere">{choice.text}</span>
            <Badge className="shrink-0 whitespace-nowrap">
              {copy.optionVotes(choice.selectionsCount)}
            </Badge>
          </li>
        ))}
      </ul>
      {remaining > 0 && (
        <p className="m-0 text-sm text-secondary">{copy.moreOptions(remaining)}</p>
      )}
    </section>
  );
}
