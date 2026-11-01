'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortalDirectory } from '../usePortalDirectory';
import { Button, EmptyState, QueryBoundary } from '@/components/ui';
import { gentlePathEditorialDiscoveryStrings as copy } from '@/strings';
import {
  useCommunityPosts,
  useCommunityStatus,
} from '@/modules/community/hooks';
import { CommunityPostCard } from '@/modules/community/components/CommunityPostCard';
import { CommunityReportDialog } from '@/modules/community/components/CommunityReportDialog';
import { useCommunityFeedPreference } from '@/modules/community/useCommunityFeedPreference';
import type { CommunityReportTarget } from '@/modules/community/models/communityReportTarget';
import { CommunityPostQuerySchema } from '@/modules/community/models/communityPostQuery';
import { usePolls, usePollStatus } from '@/modules/polls/hooks';
import { PollQuerySchema } from '@/modules/polls/models/pollQuery';
import { PollCard } from '@/modules/polls/components/PollCard';
import { useGuides, useEditorialResources } from '@/modules/editorial/hooks';
import { GuideCard } from '@/modules/editorial/components/GuideCard';
import { mapEditorialResourceToPortal } from '@/modules/editorial/services/mapEditorialResourceToPortal';
import { ResourceCard } from './ResourceCard';
import { usePublicBlogArticles } from '@/modules/blog/hooks';
import { MilestoneContentSection } from './MilestoneContentSection';
import type { MilestoneRelatedSection } from '../models/milestoneRelatedSection';
import { BlogArticleCard } from '@/modules/blog/components/BlogArticleCard';

interface PagingProps {
  offset: number;
  setOffset: (offset: number) => void;
}
const empty = (
  <EmptyState
    variant="plain"
    title={copy.emptyRelated}
    description={copy.emptyRelatedHint}
  />
);

function Paging({
  offset,
  hasMore,
  busy,
  itemCount,
  onChange,
}: {
  offset: number;
  hasMore: boolean;
  busy: boolean;
  itemCount: number;
  onChange: (offset: number) => void;
}) {
  useEffect(() => {
    if (!busy && offset > 0 && itemCount === 0)
      onChange(Math.max(0, offset - 3));
  }, [busy, itemCount, offset, onChange]);
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        variant="secondary"
        disabled={busy || !offset}
        onClick={() => onChange(Math.max(0, offset - 3))}
      >
        {copy.previous}
      </Button>
      <Button
        variant="secondary"
        disabled={busy || !hasMore}
        onClick={() => onChange(offset + 3)}
      >
        {copy.next}
      </Button>
    </div>
  );
}

function RelatedPosts({
  milestoneId,
  returnTo,
  kind,
  offset,
  setOffset,
}: { milestoneId: string; returnTo: string; kind?: 'QUESTION' } & PagingProps) {
  const [report, setReport] = useState<CommunityReportTarget | null>(null);
  const query = useCommunityPosts(
    CommunityPostQuerySchema.parse({
      milestoneId,
      postKind: kind,
      limit: 3,
      offset,
    }),
  );
  const status = useCommunityStatus();
  const preferences = useCommunityFeedPreference();
  const router = useRouter();
  return (
    <>
      <QueryBoundary
        query={query}
        loadingMessage={copy.relatedLoadingDescription}
      >
        {(page) => (
          <div className="grid min-w-0 gap-4">
            <div className="gp-milestone-detail__cards gp-milestone-detail__cards--community">
              {page.data.filter(
                (post) => !preferences.hiddenPostIds.includes(post.id),
              ).length
                ? page.data
                    .filter(
                      (post) => !preferences.hiddenPostIds.includes(post.id),
                    )
                    .map((post) => (
                      <CommunityPostCard
                        headingLevel="h3"
                        key={post.id}
                        post={post}
                        own={false}
                        writable={status.data?.enabled === true}
                        busy={false}
                        returnTo={returnTo}
                        onEdit={() => router.push(`/community/${post.id}`)}
                        onDelete={() => router.push(`/community/${post.id}`)}
                        onReport={() =>
                          setReport({
                            id: post.id,
                            targetType: 'post',
                            title: post.title,
                          })
                        }
                        onHide={() => preferences.hide(post.id)}
                      />
                    ))
                : empty}
            </div>
            <Paging
              offset={offset}
              hasMore={page.page.hasMore}
              busy={query.isFetching}
              itemCount={page.data.length}
              onChange={setOffset}
            />
          </div>
        )}
      </QueryBoundary>
      {preferences.error && (
        <p role="alert" className="text-sm text-error-primary">
          {preferences.error}
        </p>
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
function RelatedPolls({
  milestoneId,
  returnTo,
  offset,
  setOffset,
}: { milestoneId: string; returnTo: string } & PagingProps) {
  const query = usePolls(
    PollQuerySchema.parse({ milestone_id: milestoneId, limit: 3, offset }),
  );
  const status = usePollStatus();
  const router = useRouter();
  return (
    <QueryBoundary
      query={query}
      loadingMessage={copy.relatedLoadingDescription}
    >
      {(page) => (
        <div className="grid min-w-0 gap-4">
          <div className="gp-milestone-detail__cards gp-milestone-detail__cards--community">
            {page.data.length
              ? page.data.map((poll) => (
                  <PollCard
                    headingLevel="h3"
                    key={poll.id}
                    poll={poll}
                    own={false}
                    writable={status.data?.enabled === true}
                    busy={false}
                    returnTo={returnTo}
                    onEdit={() => router.push(`/polls/${poll.id}`)}
                    onDelete={() => router.push(`/polls/${poll.id}`)}
                    onTag={(tag) =>
                      router.push(`/polls?tag=${encodeURIComponent(tag)}`)
                    }
                  />
                ))
              : empty}
          </div>
          <Paging
            offset={offset}
            hasMore={page.page.hasMore}
            busy={query.isFetching}
            itemCount={page.data.length}
            onChange={setOffset}
          />
        </div>
      )}
    </QueryBoundary>
  );
}
function RelatedGuides({
  milestoneId,
  offset,
  setOffset,
}: { milestoneId: string } & PagingProps) {
  const query = useGuides({
    query: '',
    milestone_id: milestoneId,
    limit: 3,
    offset,
  });
  return (
    <QueryBoundary
      query={query}
      loadingMessage={copy.relatedLoadingDescription}
    >
      {(page) => (
        <div className="grid min-w-0 gap-4">
          <div className="gp-milestone-detail__cards gp-milestone-detail__cards--editorial">
            {page.data.length
              ? page.data.map((guide) => (
                  <GuideCard
                    key={guide.id}
                    guide={guide}
                    headingLevel="h3"
                    variant="related"
                  />
                ))
              : empty}
          </div>
          <Paging
            offset={offset}
            hasMore={page.page.hasMore}
            busy={query.isFetching}
            itemCount={page.data.length}
            onChange={setOffset}
          />
        </div>
      )}
    </QueryBoundary>
  );
}
function RelatedResources({
  milestoneId,
  collections,
  offset,
  setOffset,
}: { milestoneId: string; collections: boolean } & PagingProps) {
  const query = useEditorialResources({
    query: '',
    milestone_id: milestoneId,
    ...(collections
      ? { type: 'COLLECTION' as const }
      : { exclude_collections: true }),
    limit: 3,
    offset,
  });
  return (
    <QueryBoundary
      query={query}
      loadingMessage={copy.relatedLoadingDescription}
    >
      {(page) => (
        <div className="grid min-w-0 gap-4">
          <div className="gp-milestone-detail__cards gp-milestone-detail__cards--editorial">
            {page.data.length
              ? page.data.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={mapEditorialResourceToPortal(resource, false)}
                    headingLevel="h3"
                  />
                ))
              : empty}
          </div>
          <Paging
            offset={offset}
            hasMore={page.page.hasMore}
            busy={query.isFetching}
            itemCount={page.data.length}
            onChange={setOffset}
          />
        </div>
      )}
    </QueryBoundary>
  );
}
function RelatedArticles({
  milestoneId,
  offset,
  setOffset,
}: { milestoneId: string } & PagingProps) {
  const query = usePublicBlogArticles({
    query: '',
    milestone_id: milestoneId,
    limit: 3,
    offset,
  });
  return (
    <QueryBoundary
      query={query}
      loadingMessage={copy.relatedLoadingDescription}
    >
      {(page) => (
        <div className="grid min-w-0 gap-4">
          <div className="gp-milestone-detail__cards gp-milestone-detail__cards--editorial">
            {page.data.length
              ? page.data.map((article) => (
                  <BlogArticleCard
                    key={article.id}
                    article={article}
                    headingLevel="h3"
                    variant="related"
                  />
                ))
              : empty}
          </div>
          <Paging
            offset={page.offset}
            hasMore={page.offset + page.data.length < page.total}
            busy={query.isFetching}
            itemCount={page.data.length}
            onChange={setOffset}
          />
        </div>
      )}
    </QueryBoundary>
  );
}
export function MilestoneRelatedContent({
  milestoneId,
  returnTo,
}: {
  milestoneId: string;
  returnTo: string;
}) {
  const params = useSearchParams();
  const directory = usePortalDirectory();
  const paging = (section: MilestoneRelatedSection) => {
    const rawOffset = Number(params.get(`${section}Offset`) ?? 0);
    return {
      offset: Number.isSafeInteger(rawOffset) && rawOffset > 0 ? rawOffset : 0,
      setOffset: (offset: number) =>
        directory.update({
          [`${section}Offset`]: offset ? String(offset) : undefined,
        }),
    };
  };
  return (
    <>
      <MilestoneContentSection
        id="posts"
        title={copy.discussion}
        description={copy.relatedPostsDescription}
      >
        <RelatedPosts
          {...paging('posts')}
          milestoneId={milestoneId}
          returnTo={`${returnTo}#posts`}
        />
      </MilestoneContentSection>
      <MilestoneContentSection
        id="questions"
        title={copy.question}
        description={copy.relatedQuestionsDescription}
      >
        <RelatedPosts
          {...paging('questions')}
          milestoneId={milestoneId}
          returnTo={`${returnTo}#questions`}
          kind="QUESTION"
        />
      </MilestoneContentSection>
      <MilestoneContentSection id="polls" title={copy.polls}>
        <RelatedPolls
          {...paging('polls')}
          milestoneId={milestoneId}
          returnTo={`${returnTo}#polls`}
        />
      </MilestoneContentSection>
      <MilestoneContentSection id="guides" title={copy.guides}>
        <RelatedGuides {...paging('guides')} milestoneId={milestoneId} />
      </MilestoneContentSection>
      <MilestoneContentSection id="resources" title={copy.resources}>
        <RelatedResources
          {...paging('resources')}
          milestoneId={milestoneId}
          collections={false}
        />
      </MilestoneContentSection>
      <MilestoneContentSection id="collections" title={copy.collections}>
        <RelatedResources
          {...paging('collections')}
          milestoneId={milestoneId}
          collections
        />
      </MilestoneContentSection>
      <MilestoneContentSection id="articles" title={copy.articles}>
        <RelatedArticles {...paging('articles')} milestoneId={milestoneId} />
      </MilestoneContentSection>
    </>
  );
}
