'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  DataPanel,
  EmptyState,
  Field,
  Page,
  PageHeader,
  QueryBoundary,
  Select,
  UiIcon,
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
import { PortalBanner } from './components/PortalBanner';
import './styles/portal.css';
function MilestoneList({ childId }: { childId: string }) {
  const directory = useMilestoneDirectory(9);
  const query = useMilestoneGuidance(directory.query);
  const choices = useMilestoneChoices();
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
    <DataPanel
      busy={query.isFetching}
      busyLabel={milestoneCopy.loadingMilestones}
      toolbar={
        <MilestoneDirectoryFilters
          query={directory.query}
          tags={choices.data?.flatMap((milestone) => milestone.tags)}
          onChange={directory.update}
        />
      }
      footer={
        query.data && (
          <MilestonePagination
            page={query.data}
            busy={query.isFetching}
            onNavigate={(offset) => directory.update({ offset })}
          />
        )
      }
    >
      <QueryBoundary
        query={query}
        loadingMessage={milestoneCopy.loadingMilestones}
        inset
      >
        {(page) =>
          page.data.length ? (
            <div className="gp-milestone-grid p-4 sm:p-6">
              {page.data.map((milestone) => (
                <MilestoneCard
                  key={`${childId}:${milestone.id}`}
                  milestone={milestone}
                  childId={childId}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="plain"
              title={
                directory.query.query || directory.query.tag
                  ? milestoneCopy.noResultsTitle
                  : copy.common.emptyTitle
              }
              description={
                directory.query.query || directory.query.tag
                  ? milestoneCopy.noResultsDescription
                  : copy.common.emptyHint
              }
              action={
                directory.query.query || directory.query.tag ? (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      directory.update({ query: '', tag: '', offset: 0 })
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
    </DataPanel>
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
        eyebrow={copy.navigation.milestones}
      />
      <PortalBanner
        title={copy.milestones.bannerTitle}
        description={copy.milestones.bannerDescription}
        image="/gentlepath/path-landscape-v2.png"
        landscape
      />
      <QueryBoundary query={children}>
        {(profiles) => {
          const childId =
            profiles.find((child) => child.id === params.get('child'))?.id ??
            profiles[0]?.id;
          return childId ? (
            <>
              <div className="gp-milestone-context">
                <Field
                  labelText={copy.milestones.childLabel}
                  className="w-full max-w-sm"
                >
                  <Select
                    value={childId}
                    onValueChange={(value) =>
                      directory.update({ child: value, offset: 0 })
                    }
                  >
                    {profiles.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <p className="gp-portal-footnote">
                  <UiIcon name="lock" className="size-5" />
                  {copy.milestones.privacyHint}
                </p>
              </div>
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
