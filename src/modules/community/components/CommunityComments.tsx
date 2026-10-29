import { useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { useCommunityComments, useDeleteCommunityComment } from '../hooks';
import { useCommunityDirectory } from '../useCommunityDirectory';
import type { CommunityComment } from '../models/communityComment';
import type { CommunityReportTarget } from '../models/communityReportTarget';
import { CommunityIdentity } from './CommunityIdentity';
import { CommunityReactionButton } from './CommunityReactionButton';
import { CommunityCommentEditor } from './CommunityCommentEditor';
import { CommunityPagination } from './CommunityPagination';

interface CommunityCommentsProps {
  postId: string;
  count: number;
  writable: boolean;
  onReport: (target: CommunityReportTarget) => void;
}
export function CommunityComments({
  postId,
  count,
  writable,
  onReport,
}: CommunityCommentsProps) {
  const directory = useCommunityDirectory();
  const query = useCommunityComments(postId, {
    limit: 10,
    offset: directory.offset,
  });
  const remove = useDeleteCommunityComment();
  const [editor, setEditor] = useState<CommunityComment | null>(null);
  const { session } = useSessionState();
  const { showAlert, showToast } = usePresentationService();
  const deleting = useRef(false);
  async function deleteComment(comment: CommunityComment) {
    if (deleting.current) return;
    deleting.current = true;
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
      void showToast({ title: copy.deletedComment, intent: 'success' });
    } catch {
      /* Inline recovery. */
    } finally {
      deleting.current = false;
    }
  }
  return (
    <section
      className="grid min-w-0 gap-5"
      aria-labelledby="community-comments-title"
    >
      <div className="gp-portal-section-heading">
        <h2 id="community-comments-title">{copy.commentsTitle}</h2>
        <Badge>{count}</Badge>
      </div>
      <CommunityCommentEditor
        postId={postId}
        disabled={!writable}
        onSaved={() => directory.setOffset(0)}
      />
      <MutationError error={remove.error} />
      <QueryBoundary query={query}>
        {(result) => (
          <>
            {result.data.length ? (
              <div className="grid gap-4">
                {result.data.map((comment) => (
                  <Card key={comment.id} className="gp-community-comment">
                    <CommunityIdentity
                      author={comment.author}
                      createdAt={comment.createdAt}
                      updatedAt={comment.updatedAt}
                      own={comment.userId === session?.user.id}
                    />
                    <p className="gp-community-body">{comment.body}</p>
                    <div className="gp-community-post__footer">
                      <CommunityReactionButton
                        id={comment.id}
                        targetType="post_comment"
                        liked={comment.liked}
                        count={comment.likeCount}
                        disabled={!writable}
                      />
                      <div className="flex flex-wrap gap-1">
                        {comment.userId === session?.user.id && (
                          <>
                            <Button
                              variant="ghost"
                              disabled={!writable || remove.isPending}
                              onClick={() => setEditor(comment)}
                            >
                              {copy.edit}
                            </Button>
                            <Button
                              variant="destructive"
                              aria-label={copy.deleteComment}
                              disabled={!writable || remove.isPending}
                              onClick={() => {
                                void deleteComment(comment);
                              }}
                            >
                              <UiIcon name="trash" className="size-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          disabled={!writable}
                          onClick={() =>
                            onReport({
                              id: comment.id,
                              targetType: 'post_comment',
                              title: copy.commentSnapshotTitle,
                            })
                          }
                        >
                          {copy.report}
                        </Button>
                      </div>
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
            <CommunityPagination
              page={result.page}
              count={result.data.length}
              busy={query.isFetching}
              onNavigate={directory.setOffset}
            />
          </>
        )}
      </QueryBoundary>
      {editor && (
        <CommunityCommentEditor
          key={editor.id}
          postId={postId}
          comment={editor}
          onClose={() => setEditor(null)}
          onSaved={() => {}}
        />
      )}
    </section>
  );
}
