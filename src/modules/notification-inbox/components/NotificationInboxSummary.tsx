import { Badge, UiIcon } from '@/components/ui';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import type { NotificationCounts } from '../models/notificationCounts';

export function NotificationInboxSummary({
  counts,
  unavailable,
  filtered,
}: {
  counts?: NotificationCounts;
  unavailable: boolean;
  filtered: boolean;
}) {
  if (unavailable) return <span role="status">{copy.countUnavailable}</span>;
  if (!counts) return <span role="status">{copy.loadingSummaryHint}</span>;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
      <Badge intent="brand" className="gap-2 px-3 py-1.5">
        <UiIcon
          name={counts.unreadCount ? 'bell' : 'check'}
          className="size-4"
        />
        {copy.unreadCount(counts.unreadCount)}
      </Badge>
      <span className="text-sm text-secondary">
        {filtered
          ? copy.matchingTotalHint(counts.totalCount)
          : copy.inboxTotalHint(counts.totalCount)}
      </span>
    </div>
  );
}
