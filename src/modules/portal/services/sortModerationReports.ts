import type { ModerationReport } from '../models/moderationReport';
import type { ModerationSort } from '../models/moderationSort';

export function sortModerationReports(
  reports: ModerationReport[],
  sort: ModerationSort,
) {
  return [...reports].sort((left, right) => {
    const latest = right.createdAt.localeCompare(left.createdAt);
    if (sort === 'oldest') return -latest || left.id.localeCompare(right.id);
    if (sort === 'title') {
      return (
        left.contentTitle.localeCompare(right.contentTitle, 'en-US') || latest
      );
    }
    if (sort === 'reviewed') {
      return (
        (right.reviewedAt ?? '').localeCompare(left.reviewedAt ?? '') || latest
      );
    }
    return latest || left.id.localeCompare(right.id);
  });
}
