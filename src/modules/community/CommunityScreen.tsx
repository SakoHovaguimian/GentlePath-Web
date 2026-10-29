'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DirectoryFilters,
  EmptyState,
  NavigationLink,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { PortalBanner } from '@/modules/portal/components/PortalBanner';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { useCommunityPosts, useCommunityStatus } from './hooks';
import { useCommunityDirectory } from './useCommunityDirectory';
import { useCommunityPostActions } from './useCommunityPostActions';
import type { CommunityPost } from './models/communityPost';
import type { CommunityReportTarget } from './models/communityReportTarget';
import { CommunityPostCard } from './components/CommunityPostCard';
import { CommunityPostEditor } from './components/CommunityPostEditor';
import { CommunityReportDialog } from './components/CommunityReportDialog';
import { CommunityPagination } from './components/CommunityPagination';
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
  const remove = useCommunityPostActions();
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
    <Page className="gp-portal-page gp-community">
      <PageHeader
        title={copy.title}
        description={copy.description}
        eyebrow={copy.eyebrow}
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
      />
      <PortalBanner
        title={copy.bannerTitle}
        description={copy.bannerDescription}
        image="/gentlepath/community-garden-v2.png"
        tone="lilac"
        landscape
      />
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
      <QueryBoundary query={query}>
        {(result) => (
          <>
            {result.data.length ? (
              <div className="gp-community-feed">
                {result.data.map((post) => (
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
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={filtered ? copy.noResultsTitle : copy.noPostsTitle}
                description={filtered ? copy.noResultsHint : copy.noPostsHint}
                action={
                  <Button
                    disabled={!filtered && !writable}
                    onClick={() =>
                      filtered ? clearFilters() : setEditor('new')
                    }
                  >
                    {filtered ? copy.clearFilters : copy.newPost}
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
          onClose={() => setEditor(null)}
        />
      )}
      {report && (
        <CommunityReportDialog
          target={report}
          onClose={() => setReport(null)}
        />
      )}
    </Page>
  );
}
