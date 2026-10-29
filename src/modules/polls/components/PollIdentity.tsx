import { gentlePathPollStrings as copy } from '@/strings';
import type { PollAuthor } from '../models/pollAuthor';

const numericYear = 'numeric';

export function PollIdentity({
  author,
  createdAt,
}: {
  author: PollAuthor | null;
  createdAt: string;
}) {
  const name = author
    ? copy.authorName(author.firstName, author.lastName)
    : copy.authorFallback;
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: numericYear,
  });
  return (
    <p className="m-0 text-sm text-tertiary wrap-anywhere">
      <time dateTime={createdAt}>{copy.authorDate(name, date)}</time>
    </p>
  );
}
