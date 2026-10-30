'use client';
import { useRef, useState } from 'react';
import {
  Badge,
  DirectoryPagination,
  EmptyState,
  PageSection,
  QueryBoundary,
} from '@/components/ui';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathPollStrings as copy } from '@/strings';
import type { PollComment } from '../models/pollComment';
import { usePollComments } from '../hooks';
import { usePollCommentActions } from '../usePollCommentActions';
import { usePollDirectory } from '../usePollDirectory';
import { PollCommentEditor } from './PollCommentEditor';
import { PollCommentCard } from './PollCommentCard';
import { PollReplies } from './PollReplies';

export function PollComments({
  pollId,
  count,
  writable,
}: {
  pollId: string;
  count: number;
  writable: boolean;
}) {
  const directory = usePollDirectory();
  const query = usePollComments(pollId, {
    limit: 25,
    offset: directory.commentOffset,
    rootOnly: true,
  });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const remove = usePollCommentActions((comment) => {
    if (
      !comment.parentCommentId &&
      query.data?.data.length === 1 &&
      directory.commentOffset
    )
      directory.setCommentOffset(Math.max(0, directory.commentOffset - 25));
  });
  const [editor, setEditor] = useState<PollComment | null>(null);
  const [replying, setReplying] = useState<PollComment | null>(null);
  const status =
    query.error && 'status' in query.error
      ? Number(query.error.status)
      : undefined;
  const retain =
    query.data !== undefined && ![401, 403, 404].includes(Number(status));
  return (
    <PageSection
      id="poll-discussion"
      className="gp-community-discussion"
      headingRef={headingRef}
      title={copy.discussionTitle}
      description={copy.discussionDescription}
      action={<Badge>{copy.comments(count)}</Badge>}
    >
      <PollCommentEditor
        pollId={pollId}
        writable={writable}
        onSaved={() => directory.setCommentOffset(0)}
      />
      <MutationError error={remove.error ?? (retain ? query.error : null)} />
      <QueryBoundary query={query} showError={!retain}>
        {(result) => (
          <>
            {result.data.length ? (
              <div className="gp-community-replies">
                {result.data.map((comment) => (
                  <div key={comment.id} className="gp-community-comment-thread">
                    <PollCommentCard
                      comment={comment}
                      writable={writable}
                      busy={remove.isPending}
                      onEdit={() => setEditor(comment)}
                      onDelete={() => {
                        void remove.deleteComment(comment);
                      }}
                      onReply={() => setReplying(comment)}
                    />
                    <PollReplies
                      pollId={pollId}
                      parentId={comment.id}
                      writable={writable}
                      busy={remove.isPending}
                      onEdit={setEditor}
                      onDelete={(reply) => {
                        void remove.deleteComment(reply);
                      }}
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
            <DirectoryPagination
              page={result.page}
              count={result.data.length}
              busy={query.isFetching}
              label={copy.commentPagination}
              range={copy.range}
              onNavigate={directory.setCommentOffset}
            />
          </>
        )}
      </QueryBoundary>
      {replying && (
        <PollCommentEditor
          key={`reply-${replying.id}`}
          pollId={pollId}
          parentCommentId={replying.id}
          writable={writable}
          onClose={() => setReplying(null)}
          onSaved={() => {}}
        />
      )}
      {editor && (
        <PollCommentEditor
          key={editor.id}
          pollId={pollId}
          comment={editor}
          writable={writable}
          onClose={() => setEditor(null)}
          onSaved={() => {}}
          onDeleted={() => {
            if (
              !editor.parentCommentId &&
              query.data?.data.length === 1 &&
              directory.commentOffset
            )
              directory.setCommentOffset(
                Math.max(0, directory.commentOffset - 25),
              );
          }}
        />
      )}
    </PageSection>
  );
}
