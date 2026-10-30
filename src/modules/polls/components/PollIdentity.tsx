import { CommunityIdentity } from '@/modules/community/components/CommunityIdentity';
import type { PollAuthor } from '../models/pollAuthor';

export function PollIdentity({
  author,
  createdAt,
  updatedAt = createdAt,
  own = false,
}: {
  author: PollAuthor | null;
  createdAt: string;
  updatedAt?: string;
  own?: boolean;
}) {
  return (
    <CommunityIdentity
      author={author}
      createdAt={createdAt}
      updatedAt={updatedAt}
      own={own}
    />
  );
}
