import { useRef, useState } from 'react';
import { Badge, Button, EmptyState, QueryBoundary } from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import type { MilestoneGuidance } from '../models/milestoneGuidance';
import type { MilestoneObservation } from '../models/milestoneObservation';
import {
  useDeleteMilestoneObservation,
  useMilestoneObservations,
} from '../hooks';
import { formatMilestoneDate } from '../formatMilestoneDate';
import { MilestonePagination } from './MilestonePagination';

export function MilestoneObservationTimeline({
  childId,
  milestone,
  onEdit,
}: {
  childId: string;
  milestone: MilestoneGuidance;
  onEdit: (observation: MilestoneObservation) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const busy = useRef(false);
  const query = useMilestoneObservations({
    child_id: childId,
    milestone_id: milestone.id,
    limit: 9,
    offset,
  });
  const remove = useDeleteMilestoneObservation();
  const { showAlert, showToast } = usePresentationService();
  async function deleteObservation(observation: MilestoneObservation) {
    if (busy.current) return;
    busy.current = true;
    setConfirming(true);
    try {
      if (
        !(await showAlert({
          title: copy.observationDeleteTitle,
          description: copy.observationDeleteDescription,
          tone: 'danger',
          confirmLabel: copy.observationDelete,
          cancelLabel: copy.cancel,
        }))
      )
        return;
      await remove.mutateAsync(observation.id);
      if (query.data?.data.length === 1 && offset > 0)
        setOffset(Math.max(0, offset - 9));
      void showToast({ title: copy.observationDeleted, intent: 'success' });
    } catch {
      /* Keep the selected history page available for recovery. */
    } finally {
      busy.current = false;
      setConfirming(false);
    }
  }
  return (
    <div className="grid gap-5">
      <MutationError error={remove.error} />
      <QueryBoundary query={query} loadingMessage={copy.observationLoad}>
        {(page) =>
          page.data.length ? (
            <div className="grid gap-4">
              {page.data.map((observation) => (
                <article
                  key={observation.id}
                  className="grid gap-3 rounded-xl border border-secondary p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge intent="neutral">
                      {observation.response_option?.deleted
                        ? copy.retiredOption(observation.response_option.label)
                        : (observation.response_option?.label ??
                          copy.responseLabel)}
                    </Badge>
                    <time
                      className="text-xs text-tertiary"
                      dateTime={observation.observed_at}
                    >
                      {formatMilestoneDate(observation.observed_at)}
                    </time>
                  </div>
                  {observation.notes && (
                    <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
                      {observation.notes}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      disabled={remove.isPending || confirming}
                      onClick={() => onEdit(observation)}
                    >
                      {copy.observationEditTitle}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={remove.isPending || confirming}
                      onClick={() => void deleteObservation(observation)}
                    >
                      {copy.observationDelete}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              variant="plain"
              title={copy.noObservationsTitle}
              description={copy.noObservationsDescription}
            />
          )
        }
      </QueryBoundary>
      {query.data && (
        <MilestonePagination
          page={query.data}
          busy={query.isFetching}
          onNavigate={setOffset}
        />
      )}
    </div>
  );
}
