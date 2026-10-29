import { Badge } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import type { FamilyTip } from '../models/familyTip';
import { formatMilestoneDate } from '../formatMilestoneDate';
interface TipReviewRecordProps {
  tip: FamilyTip;
}
export function TipReviewRecord({ tip }: TipReviewRecordProps) {
  const review = tip.review;
  return (
    <div className="grid gap-3 rounded-xl border border-secondary bg-secondary_subtle p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-primary">
          {copy.reviewHistoryTitle}
        </span>
        <Badge
          dot
          intent={
            tip.approval_status === 'APPROVED'
              ? 'success'
              : tip.approval_status === 'REJECTED'
                ? 'warning'
                : 'neutral'
          }
        >
          {copy.statuses[tip.approval_status]}
        </Badge>
      </div>
      {review?.reviewed_at ? (
        <dl className="m-0 grid gap-3 text-xs text-secondary">
          <div>
            <dt className="font-medium">{copy.reviewedLabel}</dt>
            <dd className="m-0 mt-1">
              <time dateTime={review.reviewed_at}>
                {formatMilestoneDate(review.reviewed_at)}
              </time>
            </dd>
          </div>
          <div>
            <dt className="font-medium">{copy.reviewerLabel}</dt>
            <dd className="m-0 mt-1 wrap-anywhere">
              {review.reviewed_by_user_id ?? copy.unavailableAuthor}
            </dd>
          </div>
          {review.review_notes && (
            <div>
              <dt className="font-medium">{copy.reviewNotesLabel}</dt>
              <dd className="m-0 mt-1 whitespace-pre-wrap wrap-anywhere">
                {review.review_notes}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="m-0 text-sm text-secondary">{copy.pendingReview}</p>
      )}
      <p className="m-0 text-xs text-tertiary">{copy.reviewHistoryHint}</p>
    </div>
  );
}
