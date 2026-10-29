import { Badge } from '@/components/ui';
import { gentlePathCommunityStrings as copy } from '@/strings';
import type { CommunityAuthor } from '../models/communityAuthor';

const numericYear = 'numeric';

interface CommunityIdentityProps {
  author: CommunityAuthor | null;
  createdAt: string;
  updatedAt: string;
  own: boolean;
}
export function CommunityIdentity({
  author,
  createdAt,
  updatedAt,
  own,
}: CommunityIdentityProps) {
  const name = author
    ? copy.authorName(author.firstName, author.lastName)
    : copy.communityMember;
  return (
    <div className="gp-community-identity">
      <span aria-hidden="true" className="gp-community-avatar">
        {author
          ? `${author.firstName[0] ?? ''}${author.lastName[0] ?? ''}`
          : ''}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 text-sm font-semibold text-primary wrap-anywhere">
            {name}
          </p>
          {own && <Badge>{copy.ownLabel}</Badge>}
        </div>
        <p className="m-0 mt-1 text-xs text-tertiary">
          <time dateTime={createdAt}>
            {new Date(createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: numericYear,
              hour: 'numeric',
              minute: '2-digit',
            })}
          </time>
          {updatedAt !== createdAt && (
            <span className="ms-2">{copy.edited}</span>
          )}
        </p>
      </div>
    </div>
  );
}
