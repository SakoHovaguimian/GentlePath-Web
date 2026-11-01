import { UiIcon } from '@/components/ui';
import { gentlePathApplicationStrings as copy } from '@/strings';
import type { ApplicationFollowUp } from '../models/applicationFollowUp';

export function ApplicationCountdown({
  followUp,
}: {
  followUp?: ApplicationFollowUp;
}) {
  const days = followUp?.days_until_due;
  return (
    <div
      className="gp-application-countdown"
      data-overdue={days != null && days < 0 ? true : undefined}
    >
      {days != null ? (
        <>
          <span className="gp-application-countdown__value" aria-hidden="true">
            {copy.countdownValue(days)}
          </span>
          <span className="gp-application-countdown__label">
            <span className="sr-only">{copy.countdownValue(days)} </span>
            {copy.countdownLabel(days)}
          </span>
        </>
      ) : (
        <>
          <UiIcon name="calendar" className="size-7" />
          <span className="gp-application-countdown__label">
            {followUp ? copy.nextFollowUpLabel : copy.noDueDate}
          </span>
        </>
      )}
      {followUp && (
        <time
          dateTime={followUp.due_on}
          className="gp-application-countdown__date"
        >
          {copy.dateDescription(followUp.due_on)}
        </time>
      )}
    </div>
  );
}
