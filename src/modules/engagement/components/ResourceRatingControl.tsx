'use client';
import { useId, useRef, useState } from 'react';
import {
  Button,
  Card,
  InlineLoading,
  QueryBoundary,
  Spinner,
  StarRating,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathEngagementStrings as copy } from '@/strings';
import { useResourceEngagement, useRateResource } from '../hooks';
export function ResourceRatingControl({ resourceId }: { resourceId: string }) {
  const hintId = useId();
  const busy = useRef(false);
  const [feedback, setFeedback] = useState<'saved' | 'removed' | null>(null);
  const query = useResourceEngagement(resourceId);
  const mutation = useRateResource(resourceId);
  const { showToast } = usePresentationService();
  async function rate(rating: number | null) {
    if (busy.current) return;
    busy.current = true;
    setFeedback(null);
    try {
      await mutation.mutateAsync(rating === null ? null : { rating });
      setFeedback(rating === null ? 'removed' : 'saved');
      void showToast({
        title:
          rating === null ? copy.ratingRemovedTitle : copy.ratingSavedTitle,
        intent: 'success',
      });
    } catch {
      /* Inline recovery. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <Card className="grid gap-5 border-utility-warning-200">
      <div className="grid gap-2">
        <h2 className="m-0 font-display text-2xl font-normal text-primary">
          {copy.ratingTitle}
        </h2>
        <p className="m-0 text-sm text-secondary">{copy.ratingDescription}</p>
      </div>
      <QueryBoundary
        query={query}
        loadingFallback={
          <div className="grid min-h-32 content-center">
            <InlineLoading message={copy.ratingLoadingTitle} />
          </div>
        }
      >
        {(data) => {
          const selected =
            mutation.isPending && mutation.variables
              ? mutation.variables.rating
              : data.rating;
          return (
            <div className="grid min-w-0 gap-4">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-8 gap-y-4">
                <StarRating
                  value={selected}
                  label={copy.ratingLabel}
                  valueLabel={
                    selected === null
                      ? copy.ratingNotSelected
                      : copy.ratingOption(selected)
                  }
                  getOptionLabel={copy.ratingOption}
                  disabled={mutation.isPending}
                  busy={mutation.isPending}
                  describedBy={hintId}
                  onValueChange={(value) => {
                    void rate(value);
                  }}
                />
                {data.rating !== null && (
                  <Button
                    variant="destructive"
                    loading={mutation.isPending && mutation.variables === null}
                    disabled={mutation.isPending}
                    onClick={() => {
                      void rate(null);
                    }}
                  >
                    <UiIcon name="trash" className="size-4" />
                    {copy.removeRating}
                  </Button>
                )}
              </div>
              <p id={hintId} className="m-0 text-xs text-tertiary">
                {copy.ratingKeyboardHint}
              </p>
              <div
                role="status"
                aria-live="polite"
                className="flex min-h-6 items-center gap-2 text-sm text-secondary"
              >
                {mutation.isPending ? (
                  <>
                    <Spinner className="size-4" />
                    {copy.ratingSavingTitle}
                  </>
                ) : feedback ? (
                  <>
                    <UiIcon
                      key={feedback}
                      name="check"
                      className="size-4 text-success-primary"
                    />
                    {feedback === 'saved'
                      ? copy.ratingSavedDescription
                      : copy.ratingRemovedDescription}
                  </>
                ) : null}
              </div>
            </div>
          );
        }}
      </QueryBoundary>
      <MutationError error={mutation.error} />
    </Card>
  );
}
