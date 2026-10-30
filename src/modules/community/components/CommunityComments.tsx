import { useState } from 'react';
import { Badge, EmptyState, QueryBoundary } from '@/components/ui';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { useCommunityComments } from '../hooks';
import { useCommunityCommentActions } from '../useCommunityCommentActions';
import { useCommunityDirectory } from '../useCommunityDirectory';
import type { CommunityComment } from '../models/communityComment';
import type { CommunityReportTarget } from '../models/communityReportTarget';
import { CommunityCommentEditor } from './CommunityCommentEditor';
import { CommunityCommentCard } from './CommunityCommentCard';
import { CommunityReplies } from './CommunityReplies';
import { CommunityPagination } from './CommunityPagination';

export function CommunityComments({
  postId,
  count,
  writable,
  onReport,
}: {
  postId: string;
  count: number;
  writable: boolean;
  onReport: (target: CommunityReportTarget) => void;
}) {
  const directory = useCommunityDirectory();
  const query = useCommunityComments(postId, {
    limit: 10,
    offset: directory.offset,
    rootOnly: true,
  });
  const remove = useCommunityCommentActions((comment) => {
    if (
      !comment.parentCommentId &&
      query.data?.data.length === 1 &&
      directory.offset
    )
      directory.setOffset(Math.max(0, directory.offset - 10));
  });
  const [editor, setEditor] = useState<CommunityComment | null>(null);
  const [replying, setReplying] = useState<CommunityComment | null>(null);
  const status =
    query.error && 'status' in query.error
      ? Number(query.error.status)
      : undefined;
  const retain =
    query.data !== undefined && ![401, 403, 404].includes(Number(status));
  function report(comment: CommunityComment) {
    onReport({
      id: comment.id,
      targetType: 'post_comment',
      title: copy.commentSnapshotTitle,
    });
  }
  return (
    <section
      className="gp-community-discussion grid min-w-0 gap-5"
      aria-labelledby="community-comments-title"
    >
      <div className="gp-portal-section-heading">
        <h2 id="community-comments-title" tabIndex={-1}>
          {copy.commentsTitle}
        </h2>
        <Badge>{count}</Badge>
      </div>
      <CommunityCommentEditor
        postId={postId}
        disabled={!writable}
        onSaved={() => directory.setOffset(0)}
      />
      <MutationError error={remove.error ?? (retain ? query.error : null)} />
      <QueryBoundary query={query} showError={!retain}>
        {(result) => (
          <>
            {result.data.length ? (
              <div className="gp-community-replies">
                {result.data.map((comment) => (
                  <div key={comment.id} className="gp-community-comment-thread">
                    <CommunityCommentCard
                      comment={comment}
                      writable={writable}
                      busy={remove.isPending}
                      onEdit={() => setEditor(comment)}
                      onDelete={() => {
                        void remove.deleteComment(comment);
                      }}
                      onReport={() => report(comment)}
                      onReply={() => setReplying(comment)}
                    />
                    <CommunityReplies
                      postId={postId}
                      parentId={comment.id}
                      writable={writable}
                      busy={remove.isPending}
                      onEdit={setEditor}
                      onDelete={(reply) => {
                        void remove.deleteComment(reply);
                      }}
                      onReport={report}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title={copy.noCommentsTitle}
                description={copy.noCommentsHint}
              />
            )}
            <CommunityPagination
              page={result.page}
              count={result.data.length}
              busy={query.isFetching}
              onNavigate={directory.setOffset}
            />
          </>
        )}
      </QueryBoundary>
      {replying && (
        <CommunityCommentEditor
          key={`reply-${replying.id}`}
          postId={postId}
          parentCommentId={replying.id}
          disabled={!writable}
          onClose={() => setReplying(null)}
          onSaved={() => {}}
        />
      )}
      {editor && (
        <CommunityCommentEditor
          key={editor.id}
          postId={postId}
          comment={editor}
          disabled={!writable}
          onClose={() => setEditor(null)}
          onSaved={() => {}}
          onDeleted={() => {
            if (
              !editor.parentCommentId &&
              query.data?.data.length === 1 &&
              directory.offset
            )
              directory.setOffset(Math.max(0, directory.offset - 10));
          }}
        />
      )}
    </section>
  );
}
