'use client';

import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  NavigationLink,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import { gentlePathCommunityStrings as copy, strings } from '@/strings';
import { useCommunityPost, useCommunityStatus } from './hooks';
import { communityReturnPath } from './useCommunityDirectory';
import { useCommunityPostActions } from './useCommunityPostActions';
import type { CommunityPost } from './models/communityPost';
import type { CommunityReportTarget } from './models/communityReportTarget';
import { CommunityIdentity } from './components/CommunityIdentity';
import { CommunityReactionButton } from './components/CommunityReactionButton';
import { CommunityPostEditor } from './components/CommunityPostEditor';
import { CommunityReportDialog } from './components/CommunityReportDialog';
import { CommunityComments } from './components/CommunityComments';
import { CommunityPostMenu } from './components/CommunityPostMenu';
import { CommunityAttachments } from './components/CommunityAttachments';
import { useCommunityFeedPreference } from './useCommunityFeedPreference';
import '@/modules/portal/styles/portal.css';
import './styles/community.css';

export function CommunityPostScreen({ id }: { id: string }) {
  const query = useCommunityPost(id);
  const params = useSearchParams();
  const returnTo = communityReturnPath(params.get('returnTo'));
  const { confirmNavigation } = useNavigationGuard();
  const errorStatus =
    query.isError && 'status' in query.error ? query.error.status : undefined;
  const retainPost =
    query.data !== undefined && ![401, 403, 404].includes(Number(errorStatus));
  return (
    <Page className="gp-portal-page gp-community gp-community-detail">
      <Button asChild variant="ghost" className="justify-self-start">
        <NavigationLink href={returnTo} beforeNavigate={confirmNavigation}>
          <UiIcon name="chevronLeft" className="size-4" />
          {copy.back}
        </NavigationLink>
      </Button>
      {errorStatus === 404 ? (
        <EmptyState
          title={copy.unavailableTitle}
          description={copy.unavailableHint}
          action={
            <Button asChild>
              <NavigationLink
                href={returnTo}
                beforeNavigate={confirmNavigation}
              >
                {copy.back}
              </NavigationLink>
            </Button>
          }
        />
      ) : (
        <>
          {query.isError && retainPost && (
            <div className="grid gap-2">
              <MutationError error={query.error} />
              <Button
                variant="secondary"
                className="justify-self-start"
                loading={query.isFetching}
                onClick={() => {
                  void query.refetch();
                }}
              >
                {strings.ui.queryBoundary.tryAgain}
              </Button>
            </div>
          )}
          <QueryBoundary query={query} showError={!retainPost}>
            {(post) => (
              <CommunityPostDetail
                key={post.id}
                post={post}
                returnTo={returnTo}
              />
            )}
          </QueryBoundary>
        </>
      )}
    </Page>
  );
}

function CommunityPostDetail({
  post,
  returnTo,
}: {
  post: CommunityPost;
  returnTo: string;
}) {
  const { session } = useSessionState();
  const own = post.userId === session?.user.id;
  const router = useRouter();
  const status = useCommunityStatus();
  const writable = status.data?.enabled === true;
  const [editing, setEditing] = useState(false);
  const [report, setReport] = useState<CommunityReportTarget | null>(null);
  const feedPreference = useCommunityFeedPreference();
  const { confirmNavigation } = useNavigationGuard();
  const remove = useCommunityPostActions(() => {
    router.push(returnTo as Route);
  });
  return (
    <>
      {status.data?.enabled === false && (
        <Card role="status" className="grid gap-2 bg-secondary_subtle p-5">
          <h2 className="m-0 text-base font-semibold">{copy.pausedTitle}</h2>
          <p className="m-0 text-sm text-secondary">{copy.pausedDescription}</p>
        </Card>
      )}
      <MutationError error={remove.error ?? status.error} />
      {feedPreference.error && (
        <p role="alert" className="m-0 text-sm text-error-primary">
          {feedPreference.error}
        </p>
      )}
      <article className="gp-community-thread" aria-label={post.title}>
        <div className="gp-community-thread__opening">
          <div className="gp-community-post__header">
            <CommunityIdentity
              author={post.author}
              createdAt={post.createdAt}
              updatedAt={post.updatedAt}
              own={own}
            />
            <CommunityPostMenu
              contentId={post.id}
              own={own}
              writable={writable}
              busy={remove.isPending}
              onEdit={() => setEditing(true)}
              onDelete={() => {
                void remove.deletePost(post);
              }}
              onReport={() =>
                setReport({
                  id: post.id,
                  targetType: 'post',
                  title: post.title,
                })
              }
              onHide={() => {
                void Promise.resolve(confirmNavigation()).then((allowed) => {
                  if (allowed && feedPreference.hide(post.id))
                    router.push(returnTo as Route);
                });
              }}
            />
          </div>
          <PageHeader title={post.title} eyebrow={copy.postTitle} />
        </div>
        <div className="gp-community-thread__content">
          <p className="gp-community-body">{post.body}</p>
          <CommunityAttachments items={post.attachments} />
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
          <div className="gp-community-post__footer">
            <div className="flex flex-wrap items-center gap-2">
              <CommunityReactionButton
                id={post.id}
                targetType="post"
                liked={post.liked}
                count={post.likeCount}
                disabled={!writable}
              />
              <Button asChild variant="ghost">
                <a href="#community-comments-title">
                  <UiIcon name="chat" className="size-4" />
                  {copy.commentsCount(post.commentCount)}
                </a>
              </Button>
            </div>
            <SavedContentButton
              contentType="POST"
              contentId={post.id}
              variant="ghost"
            />
          </div>
        </div>
      </article>
      <CommunityComments
        postId={post.id}
        count={post.commentCount}
        writable={writable}
        onReport={setReport}
      />
      {editing && (
        <CommunityPostEditor
          post={post}
          writable={writable}
          onClose={() => setEditing(false)}
          onDeleted={() => router.push(returnTo as Route)}
        />
      )}
      {report && (
        <CommunityReportDialog
          target={report}
          onClose={() => setReport(null)}
        />
      )}
    </>
  );
}
