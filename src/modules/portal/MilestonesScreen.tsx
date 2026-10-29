'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  EmptyState,
  Field,
  Page,
  PageHeader,
  QueryBoundary,
  Select,
  UiIcon,
} from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useChildren, useMilestones } from './hooks';
import { MilestoneCard } from './components/MilestoneCard';
import { PortalBanner } from './components/PortalBanner';
import './styles/portal.css';
function MilestoneList({ childId }: { childId: string }) {
  const query = useMilestones(childId);
  return (
    <QueryBoundary query={query}>
      {(milestones) =>
        milestones.length ? (
          <div className="gp-milestone-grid">
            {milestones.map((milestone) => (
              <MilestoneCard
                key={`${childId}:${milestone.id}`}
                milestone={milestone}
                childId={childId}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={copy.common.emptyTitle}
            description={copy.common.emptyHint}
          />
        )
      }
    </QueryBoundary>
  );
}
export function MilestonesScreen() {
  const children = useChildren();
  const params = useSearchParams();
  const router = useRouter();
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
                      router.replace(
                        `/milestones?child=${encodeURIComponent(value)}`,
                        { scroll: false },
                      )
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
