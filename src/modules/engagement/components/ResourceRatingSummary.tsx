import { RatingSummary } from '@/components/ui';
import { gentlePathEngagementStrings as copy } from '@/strings';
import type { ResourceRatingSummary as ResourceRatingSummaryModel } from '../models/resourceRatingSummary';

export function ResourceRatingSummary({
  ratings,
  compact = false,
}: {
  ratings: ResourceRatingSummaryModel;
  compact?: boolean;
}) {
  return (
    <RatingSummary
      average={ratings.average}
      count={ratings.count}
      label={
        ratings.average === null
          ? copy.noRatingsDescription
          : copy.ratingSummaryDescription(ratings.average, ratings.count)
      }
      averageLabel={
        ratings.average === null ? '' : copy.ratingAverageLabel(ratings.average)
      }
      countLabel={copy.ratingCountLabel(ratings.count)}
      emptyLabel={copy.noRatingsLabel}
      compact={compact}
    />
  );
}
