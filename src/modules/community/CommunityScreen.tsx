'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DirectoryFilters,
  EmptyState,
  NavigationLink,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { useCommunityPosts, useCommunityStatus } from './hooks';
import { useCommunityDirectory } from './useCommunityDirectory';
import { useCommunityPostActions } from './useCommunityPostActions';
import { useCommunityFeedPreference } from './useCommunityFeedPreference';
import type { CommunityPost } from './models/communityPost';
import type { CommunityReportTarget } from './models/communityReportTarget';
import { CommunityPostCard } from './components/CommunityPostCard';
import { CommunityPostEditor } from './components/CommunityPostEditor';
import { CommunityReportDialog } from './components/CommunityReportDialog';
import { CommunityPagination } from './components/CommunityPagination';
import { CommunityHub } from './components/CommunityHub';
import '@/modules/portal/styles/portal.css';
import './styles/community.css';

const myPostsScope = 'mine';

export function CommunityScreen() {
  const directory = useCommunityDirectory();
  const query = useCommunityPosts({
    query: directory.query,
    tag: directory.tag,
    scope: directory.scope,
    offset: directory.offset,
    limit: 9,
  });
  const status = useCommunityStatus();
  const writable = status.data?.enabled === true;
  const { session } = useSessionState();
  const { confirmNavigation } = useNavigationGuard();
  const [editor, setEditor] = useState<CommunityPost | 'new' | null>(null);
  const [report, setReport] = useState<CommunityReportTarget | null>(null);
  const remove = useCommunityPostActions(() => {
    if (query.data?.data.length === 1 && directory.offset)
      directory.setOffset(Math.max(0, directory.offset - 9));
  });
  const feedPreference = useCommunityFeedPreference();
  const filtered = Boolean(
    directory.query || directory.tag || directory.scope === 'mine',
  );
  function clearFilters() {
    directory.update({
      query: undefined,
      tag: undefined,
      scope: undefined,
      offset: undefined,
    });
  }
  return (
    <CommunityHub
      activeView="posts"
      action={
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <NavigationLink
              href="/community/reports"
              beforeNavigate={confirmNavigation}
            >
              {copy.myReports}
            </NavigationLink>
          </Button>
          <Button disabled={!writable} onClick={() => setEditor('new')}>
            <UiIcon name="plus" />
            {copy.newPost}
          </Button>
        </div>
      }
    >
      {status.data?.enabled === false && (
        <Card className="grid gap-2 bg-secondary_subtle p-5" role="status">
          <h2 className="m-0 text-base font-semibold">{copy.pausedTitle}</h2>
          <p className="m-0 text-sm text-secondary">{copy.pausedDescription}</p>
        </Card>
      )}
      {status.isError && <MutationError error={status.error} />}
      <Card className="p-4 sm:p-5">
        <DirectoryFilters
          id="community-search"
          value={{
            query: directory.query,
            status: directory.scope === 'mine' ? 'mine' : undefined,
          }}
          onChange={(value) =>
            directory.update({
              query: value.query || undefined,
              scope: value.status,
              offset: undefined,
            })
          }
          statuses={[{ value: myPostsScope, label: copy.mine }]}
          copy={{
            search: copy.search,
            placeholder: copy.searchPlaceholder,
            clear: copy.clear,
            status: copy.view,
            allStatuses: copy.allPosts,
          }}
        />
      </Card>
      {directory.tag && (
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{directory.tag}</Badge>
          <Button
            variant="ghost"
            onClick={() =>
              directory.update({ tag: undefined, offset: undefined })
            }
          >
            {copy.clearTag}
          </Button>
        </div>
      )}
      <MutationError error={remove.error} />
      {feedPreference.hiddenPostIds.length > 0 && (
        <div className="gp-community-hidden-notice">
          <p className="m-0 text-sm text-secondary">
            {copy.hiddenPostsDescription(feedPreference.hiddenPostIds.length)}
          </p>
          <Button variant="ghost" onClick={() => feedPreference.restore()}>
            <UiIcon name="undo" className="size-4" />
            {copy.showHiddenPosts}
          </Button>
        </div>
      )}
      {feedPreference.error && (
        <p role="alert" className="m-0 text-sm text-error-primary">
          {feedPreference.error}
        </p>
      )}
      <QueryBoundary query={query} animateChanges>
        {(result) => (
          <>
            {result.data.some(
              (post) => !feedPreference.hiddenPostIds.includes(post.id),
            ) ? (
              <div className="gp-community-feed">
                {result.data
                  .filter(
                    (post) => !feedPreference.hiddenPostIds.includes(post.id),
                  )
                  .map((post) => (
                    <CommunityPostCard
                      key={post.id}
                      post={post}
                      own={post.userId === session?.user.id}
                      writable={writable}
                      busy={remove.isPending}
                      returnTo={directory.href}
                      onEdit={() => setEditor(post)}
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
                        feedPreference.hide(post.id);
                      }}
                    />
                  ))}
              </div>
            ) : (
              <EmptyState
                title={
                  result.data.length
                    ? copy.hiddenPostsTitle
                    : filtered
                      ? copy.noResultsTitle
                      : copy.noPostsTitle
                }
                description={
                  result.data.length
                    ? copy.hiddenPostsHint
                    : filtered
                      ? copy.noResultsHint
                      : copy.noPostsHint
                }
                action={
                  <Button
                    disabled={!result.data.length && !filtered && !writable}
                    onClick={() =>
                      result.data.length
                        ? feedPreference.restore()
                        : filtered
                          ? clearFilters()
                          : setEditor('new')
                    }
                  >
                    {result.data.length
                      ? copy.showHiddenPosts
                      : filtered
                        ? copy.clearFilters
                        : copy.newPost}
                  </Button>
                }
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
        <CommunityPostEditor
          key={editor === 'new' ? 'new' : editor.id}
          post={editor === 'new' ? undefined : editor}
          writable={writable}
          onClose={() => setEditor(null)}
          onDeleted={() => {
            if (query.data?.data.length === 1 && directory.offset)
              directory.setOffset(Math.max(0, directory.offset - 9));
          }}
        />
      )}
      {report && (
        <CommunityReportDialog
          target={report}
          onClose={() => setReport(null)}
        />
      )}
    </CommunityHub>
  );
}
