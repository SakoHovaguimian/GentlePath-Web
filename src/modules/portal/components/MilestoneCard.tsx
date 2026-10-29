import { useState } from 'react';
import { Badge, Button, Card, Field, Select, UiIcon } from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useObserveMilestone } from '../hooks';
import { ObservationResponseSchema, type Milestone } from '../models/milestone';
import { MutationError } from './MutationError';

export function MilestoneCard({
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
    <Card className="gp-milestone-card">
      <div className="flex items-center justify-between gap-3">
        <Badge intent="brand">{milestone.category}</Badge>
        <span className="gp-milestone-card__icon" aria-hidden="true">
          <UiIcon name="leaf" />
        </span>
      </div>
      <h2>{milestone.title}</h2>
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
        <UiIcon name="check" className="size-4" />
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
