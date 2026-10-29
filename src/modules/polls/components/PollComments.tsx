'use client';
import { useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DirectoryPagination,
  EmptyState,
  PageSection,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathPollStrings as copy } from '@/strings';
import type { PollComment } from '../models/pollComment';
import { useDeletePollComment, usePollComments } from '../hooks';
import { usePollDirectory } from '../usePollDirectory';
import { PollIdentity } from './PollIdentity';
import { PollCommentEditor } from './PollCommentEditor';
import { PollCommentReaction } from './PollCommentReaction';

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
  });
  const remove = useDeletePollComment();
  const busy = useRef(false);
  const [editor, setEditor] = useState<PollComment | null>(null);
  const { session } = useSessionState();
  const { showAlert, showToast } = usePresentationService();
  async function deleteComment(comment: PollComment) {
    if (busy.current || !writable) return;
    busy.current = true;
    try {
      if (
        !(await showAlert({
          title: copy.deleteCommentTitle,
          description: copy.deleteCommentDescription,
          tone: 'danger',
          confirmLabel: copy.deleteComment,
          cancelLabel: copy.cancel,
        }))
      )
        return;
      await remove.mutateAsync(comment.id);
      if (query.data?.data.length === 1 && directory.commentOffset)
        directory.setCommentOffset(Math.max(0, directory.commentOffset - 25));
      void showToast({ title: copy.commentDeleted, intent: 'success' });
    } catch {
      /* Inline recovery. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <PageSection
      id="poll-discussion"
      title={copy.discussionTitle}
      description={copy.discussionDescription}
      action={<Badge>{copy.comments(count)}</Badge>}
    >
      <PollCommentEditor
        pollId={pollId}
        writable={writable}
        onSaved={() => directory.setCommentOffset(0)}
      />
      <MutationError error={remove.error} />
      <QueryBoundary query={query}>
        {(result) => (
          <>
            {result.data.length ? (
              <div className="grid gap-4">
                {result.data.map((comment) => (
                  <Card key={comment.id} className="grid gap-4">
                    <PollIdentity
                      author={comment.author}
                      createdAt={comment.createdAt}
                    />
                    <p className="gp-poll-body">{comment.body}</p>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <PollCommentReaction
                        comment={comment}
                        writable={writable}
                      />
                      {comment.userId === session?.user.id && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            disabled={!writable || remove.isPending}
                            onClick={() => setEditor(comment)}
                          >
                            {copy.editComment}
                          </Button>
                          <Button
                            variant="ghost"
                            aria-label={copy.deleteComment}
                            disabled={!writable || remove.isPending}
                            onClick={() => {
                              void deleteComment(comment);
                            }}
                          >
                            <UiIcon name="trash" className="size-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
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
      {editor && (
        <PollCommentEditor
          key={editor.id}
          pollId={pollId}
          comment={editor}
          writable={writable}
          onClose={() => setEditor(null)}
          onSaved={() => {}}
        />
      )}
    </PageSection>
  );
}
