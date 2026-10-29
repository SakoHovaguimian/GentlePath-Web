'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  QueryBoundary,
  Select,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useChildren, useMilestones, useObserveMilestone } from './hooks';
import { ObservationResponseSchema, type Milestone } from './models/milestone';
import { MutationError } from './components/MutationError';

function MilestoneCard({
  milestone,
  childId,
}: {
  milestone: Milestone;
  childId: string;
}) {
  const [response, setResponse] = useState(milestone.response ?? 'emerging');
  const mutation = useObserveMilestone();
  const { showToast } = usePresentationService();
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <Badge>{milestone.category}</Badge>
        <UiIcon name="leaf" className="text-brand-secondary" />
      </div>
      <h2 className="m-0 font-display text-xl">{milestone.title}</h2>
      <p className="m-0 flex-1 text-sm leading-7 text-secondary">
        {milestone.description}
      </p>
      <Field labelText={copy.milestones.responseLabel}>
        <Select
          value={response}
          disabled={mutation.isPending}
          onValueChange={(value) =>
            setResponse(ObservationResponseSchema.parse(value))
          }
        >
          {Object.entries(copy.milestones.responses).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <MutationError error={mutation.error} />
      <Button
        variant="secondary"
        loading={mutation.isPending}
        onClick={async () => {
          try {
            await mutation.mutateAsync({
              id: milestone.id,
              input: { childId, response },
            });
            void showToast({
              title: copy.milestones.updated,
              intent: 'success',
            });
          } catch {
            /* Inline recovery. */
          }
        }}
      >
        {copy.milestones.record}
      </Button>
      <p className="m-0 text-xs text-tertiary">
        {milestone.observedAt
          ? copy.milestones.lastObserved(
              new Date(milestone.observedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
            )
          : copy.milestones.notObserved}
      </p>
    </Card>
  );
}
function MilestoneList({ childId }: { childId: string }) {
  const query = useMilestones(childId);
  return (
    <QueryBoundary query={query}>
      {(milestones) =>
        milestones.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
    <div className="grid gap-7">
      <PageHeader
        title={copy.milestones.title}
        description={copy.milestones.description}
        eyebrow={copy.navigation.milestones}
      />
      <QueryBoundary query={children}>
        {(profiles) => {
          const childId =
            profiles.find((child) => child.id === params.get('child'))?.id ??
            profiles[0]?.id;
          return childId ? (
            <>
              <Field
                labelText={copy.milestones.childLabel}
                className="max-w-sm"
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
              <MilestoneList key={childId} childId={childId} />
              <p className="text-sm text-tertiary">
                {copy.milestones.privacyHint}
              </p>
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
    </div>
  );
}
