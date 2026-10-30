'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import { MilestoneDetailsModal } from './components/MilestoneDetailsModal';
import { MilestoneProgressOverview } from './components/MilestoneProgressOverview';
import type { MilestoneGuidance } from '@/modules/milestone-admin/models/milestoneGuidance';
import type { MilestoneDetailsSection } from './models/milestoneDetailsSection';
import './styles/portal.css';
function MilestoneList({ childId }: { childId: string }) {
  const directory = useMilestoneDirectory(9);
  const query = useMilestoneGuidance({ ...directory.query, child_id: childId });
  const choices = useMilestoneChoices();
  const [details, setDetails] = useState<{
    milestone: MilestoneGuidance;
    section: MilestoneDetailsSection;
  } | null>(null);
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
      <MilestoneProgressOverview childId={childId} />
      <div className="gp-milestone-filters">
        <MilestoneDirectoryFilters
          query={directory.query}
          tags={choices.data?.flatMap((milestone) => milestone.tags)}
          onChange={directory.update}
          progress
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
                  onOpen={(section) => setDetails({ milestone, section })}
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
      {details && (
        <MilestoneDetailsModal
          milestone={details.milestone}
          childId={childId}
          initialSection={details.section}
          onClose={() => setDetails(null)}
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
          const childId =
            profiles.find((child) => child.id === params.get('child'))?.id ??
            profiles[0]?.id;
          return childId ? (
            <>
              <ChildProfilePicker
                profiles={profiles}
                value={childId}
                onValueChange={(value) =>
                  directory.update({ child: value, offset: 0 })
                }
              />
              <MilestoneList key={childId} childId={childId} />
            </>
          ) : (
            <EmptyState
              icon="leaf"
              title={copy.milestones.addChildTitle}
              description={copy.milestones.addChildHint}
              action={
                <Button asChild>
                  <Link href="/family">{copy.family.create}</Link>
                </Button>
              }
            />
          );
        }}
      </QueryBoundary>
    </Page>
  );
}
