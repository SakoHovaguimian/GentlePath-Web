import { Badge, Card, CardOpenButton, UiIcon } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { ModerationReportCardProps } from '../models/moderationReportCardProps';
import { formatReportDate } from '../formatReportDate';
import styles from '../Admin.module.css';

export function ModerationReportCard({
  report,
  onOpen,
}: ModerationReportCardProps) {
  const open = report.status === 'open';
  return (
    <Card className={styles.report} data-status={report.status}>
      <div className={styles.reportHeader}>
        <div className={styles.reportStatus}>
          <span
            className={styles.roundIcon}
            data-tone={
              open
                ? 'sunlight'
                : report.status === 'resolved'
                  ? 'sage'
                  : 'lilac'
            }
          >
            <UiIcon
              name={
                open
                  ? 'warning'
                  : report.status === 'resolved'
                    ? 'check'
                    : 'close'
              }
            />
          </span>
          <Badge
            intent={
              open
                ? 'warning'
                : report.status === 'resolved'
                  ? 'success'
                  : 'neutral'
            }
          >
            {copy.moderation[report.status]}
          </Badge>
        </div>
        <time dateTime={report.createdAt} className="text-xs text-tertiary">
          {formatReportDate(report.createdAt)}
        </time>
      </div>
      <h2>
        <CardOpenButton
          className={styles.reportOpen}
          onClick={onOpen}
          aria-label={copy.moderation.openReport(report.contentTitle)}
        >
          {report.contentTitle}
        </CardOpenButton>
      </h2>
      <p className={styles.reportReason}>{report.reason}</p>
      {!open && report.resolutionNote && (
        <div className={styles.reportResolution}>
          <span className="text-xs font-semibold text-secondary">
            {copy.moderation.noteLabel}
          </span>
          <p className="m-0 line-clamp-2 whitespace-pre-wrap text-sm text-secondary wrap-anywhere">
            {report.resolutionNote}
          </p>
        </div>
      )}
      <div className={styles.reportFooter}>
        <span className="text-xs text-tertiary">
          {copy.moderation.reportedBy(report.reporterName)}
        </span>
        <span className={styles.reportAction} aria-hidden="true">
          {open ? copy.moderation.review : copy.moderation.viewReview}
          <UiIcon name="arrowRight" className="size-4" />
        </span>
      </div>
    </Card>
  );
}
