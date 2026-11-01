'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  EmptyState,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import {
  gentlePathPortalStrings as copy,
  gentlePathMilestoneAdminStrings as milestoneCopy,
} from '@/strings';
import { useChildren } from './hooks';
import {
  useMilestoneGuidance,
  useMilestoneChoices,
} from '@/modules/milestone-admin/hooks';
import { useMilestoneDirectory } from '@/modules/milestone-admin/useMilestoneDirectory';
import { MilestoneDirectoryFilters } from '@/modules/milestone-admin/components/MilestoneDirectoryFilters';
import { MilestonePagination } from '@/modules/milestone-admin/components/MilestonePagination';
import { MilestoneCard } from './components/MilestoneCard';
import { ChildProfilePicker } from './components/ChildProfilePicker';
import { MilestoneProgressOverview } from './components/MilestoneProgressOverview';
import './styles/portal.css';
function MilestoneList({ childId }: { childId?: string }) {
  const directory = useMilestoneDirectory(9);
  const query = useMilestoneGuidance({
    ...directory.query,
    progress: childId ? directory.query.progress : undefined,
    child_id: childId,
  });
  const choices = useMilestoneChoices();
  const params = useSearchParams();
  const returnTo = `/milestones${params.size ? `?${params}` : ''}`;
  useEffect(() => {
    if (
      query.data &&
      !query.data.data.length &&
      query.data.page.offset > 0 &&
      !query.isFetching
    )
      directory.update({
        offset: Math.max(0, query.data.page.offset - query.data.page.limit),
      });
  }, [query.data, query.isFetching, directory]);
  return (
    <div className="grid min-w-0 gap-5" aria-busy={query.isFetching}>
      {childId && <MilestoneProgressOverview childId={childId} />}
      <div className="gp-milestone-filters">
        <MilestoneDirectoryFilters
          query={directory.query}
          tags={choices.data?.flatMap((milestone) => milestone.tags)}
          onChange={directory.update}
          progress={Boolean(childId)}
        />
      </div>
      <QueryBoundary
        query={query}
        loadingMessage={milestoneCopy.loadingMilestones}
        inset
      >
        {(page) =>
          page.data.length ? (
            <div className="gp-milestone-grid">
              {page.data.map((milestone) => (
                <MilestoneCard
                  key={`${childId}:${milestone.id}`}
                  milestone={milestone}
                  childId={childId}
                  returnTo={returnTo}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="plain"
              title={
                directory.query.query ||
                directory.query.tag ||
                directory.query.progress
                  ? milestoneCopy.noResultsTitle
                  : copy.common.emptyTitle
              }
              description={
                directory.query.query ||
                directory.query.tag ||
                directory.query.progress
                  ? milestoneCopy.noResultsDescription
                  : copy.common.emptyHint
              }
              action={
                directory.query.query ||
                directory.query.tag ||
                directory.query.progress ? (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      directory.update({
                        query: '',
                        tag: '',
                        progress: '',
                        offset: 0,
                      })
                    }
                  >
                    {milestoneCopy.resetFilters}
                  </Button>
                ) : undefined
              }
            />
          )
        }
      </QueryBoundary>
      {query.data && (
        <MilestonePagination
          page={query.data}
          busy={query.isFetching}
          onNavigate={(offset) => directory.update({ offset })}
        />
      )}
    </div>
  );
}
export function MilestonesScreen() {
  const children = useChildren();
  const params = useSearchParams();
  const directory = useMilestoneDirectory(9);
  return (
    <Page className="gp-portal-page gp-milestones">
      <PageHeader
        title={copy.milestones.title}
        description={copy.milestones.description}
      />
      <QueryBoundary query={children}>
        {(profiles) => {
          const childId = profiles.find(
            (child) => child.id === params.get('child'),
          )?.id;
          return (
            <>
              {profiles.length > 0 && (
                <ChildProfilePicker
                  profiles={profiles}
                  value={childId ?? ''}
                  onValueChange={(value) =>
                    directory.update({
                      child: value === childId ? '' : value,
                      ...(value === childId ? { progress: '' } : {}),
                      offset: 0,
                    })
                  }
                />
              )}
              <MilestoneList key={childId ?? 'guidance'} childId={childId} />
            </>
          );
        }}
      </QueryBoundary>
    </Page>
  );
}
