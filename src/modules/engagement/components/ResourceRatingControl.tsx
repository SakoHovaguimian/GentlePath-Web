'use client';
import { useId } from 'react';
import { Button, Card, QueryBoundary, Radio, UiIcon } from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathEngagementStrings as copy } from '@/strings';
import { useResourceEngagement, useRateResource } from '../hooks';
export function ResourceRatingControl({ resourceId }: { resourceId: string }) {
  const name = useId();
  const query = useResourceEngagement(resourceId);
  const mutation = useRateResource(resourceId);
  const { showToast } = usePresentationService();
  async function rate(rating: number | null) {
    if (mutation.isPending) return;
    try {
      await mutation.mutateAsync(rating === null ? null : { rating });
      void showToast({
        title:
          rating === null ? copy.ratingRemovedTitle : copy.ratingSavedTitle,
        intent: 'success',
      });
    } catch {
      /* Inline recovery. */
    }
  }
  return (
    <Card className="grid gap-4">
      <div className="grid gap-2">
        <h2 className="m-0 font-display text-2xl text-primary">
          {copy.ratingTitle}
        </h2>
        <p className="m-0 text-sm text-secondary">{copy.ratingDescription}</p>
      </div>
      <QueryBoundary query={query}>
        {(data) => (
          <>
            <p
              role="status"
              className="m-0 flex items-center gap-2 text-sm text-secondary"
            >
              <UiIcon name="star" className="size-4" />
              {data.average === null
                ? copy.noRatingsDescription
                : copy.ratingSummaryDescription(data.average, data.count)}
            </p>
            <fieldset
              disabled={mutation.isPending}
              className="m-0 min-w-0 border-0 p-0"
              aria-busy={mutation.isPending}
            >
              <legend className="mb-2 text-sm font-medium text-primary">
                {copy.ratingLabel}
              </legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Radio
                    key={value}
                    name={name}
                    value={value}
                    checked={data.rating === value}
                    label={copy.ratingOption(value)}
                    onChange={() => void rate(value)}
                  />
                ))}
              </div>
            </fieldset>
            {data.rating !== null && (
              <Button
                className="justify-self-start"
                variant="ghost"
                loading={mutation.isPending}
                onClick={() => void rate(null)}
              >
                {copy.removeRating}
              </Button>
            )}
          </>
        )}
      </QueryBoundary>
      <MutationError error={mutation.error} />
    </Card>
  );
}
