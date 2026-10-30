import { useCommentReplyDirectory } from '@/modules/community/useCommentReplyDirectory';
import { CommunityPagination } from '@/modules/community/components/CommunityPagination';
import { QueryBoundary } from '@/components/ui';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommunityStrings as copy } from '@/strings';
import type { CommunityComment } from '../models/communityComment';
import { useCommunityComments } from '../hooks';
import { CommunityCommentCard } from './CommunityCommentCard';

export function CommunityReplies({
  postId,
  parentId,
  writable,
  busy,
  onEdit,
  onDelete,
  onReport,
}: {
  postId: string;
  parentId: string;
  writable: boolean;
  busy: boolean;
  onEdit: (comment: CommunityComment) => void;
  onDelete: (comment: CommunityComment) => void;
  onReport: (comment: CommunityComment) => void;
}) {
  const { offset, setOffset } = useCommentReplyDirectory(parentId);
  const query = useCommunityComments(postId, {
    parentCommentId: parentId,
    limit: 5,
    offset,
  });
  const status =
    query.error && 'status' in query.error
      ? Number(query.error.status)
      : undefined;
  const retain =
    query.data !== undefined && ![401, 403, 404].includes(Number(status));
  return (
    <div
      className="gp-community-thread-replies"
      role="group"
      aria-label={copy.repliesTitle}
    >
      {retain && <MutationError error={query.error} />}
      <QueryBoundary query={query} showError={!retain}>
        {(result) =>
          result.data.length || result.page.offset ? (
            <>
              {result.data.map((reply) => (
                <CommunityCommentCard
                  key={reply.id}
                  comment={reply}
                  writable={writable}
                  busy={busy}
                  onEdit={() => onEdit(reply)}
                  onDelete={() => onDelete(reply)}
                  onReport={() => onReport(reply)}
                />
              ))}
              <CommunityPagination
                page={result.page}
                count={result.data.length}
                busy={query.isFetching}
                label={copy.repliesPagination}
                onNavigate={setOffset}
              />
            </>
          ) : null
        }
      </QueryBoundary>
    </div>
  );
}
