import { Badge, Button, Modal } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { ReportDetailsProps } from '../models/reportDetailsProps';
import { formatReportDate } from '../formatReportDate';

export function ReportDetails({ report, onClose }: ReportDetailsProps) {
  return (
    <Modal
      open
      title={copy.moderation.detailsTitle}
      description={report.contentTitle}
      onDismiss={onClose}
    >
      <div className="grid min-w-0 gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge intent={report.status === 'resolved' ? 'success' : 'neutral'}>
            {copy.moderation[report.status]}
          </Badge>
          <time dateTime={report.createdAt} className="text-xs text-tertiary">
            {formatReportDate(report.createdAt)}
          </time>
        </div>
        <dl className="m-0 grid min-w-0 gap-5">
          <div className="grid gap-2">
            <dt className="text-sm font-semibold text-primary">
              {copy.moderation.reason}
            </dt>
            <dd className="m-0 whitespace-pre-wrap text-sm leading-6 text-secondary wrap-anywhere">
              {report.reason}
            </dd>
          </div>
          <div className="grid gap-2 border-t border-secondary pt-5">
            <dt className="text-sm font-semibold text-primary">
              {copy.moderation.noteLabel}
            </dt>
            <dd className="m-0 whitespace-pre-wrap text-sm leading-6 text-secondary wrap-anywhere">
              {report.resolutionNote || copy.moderation.noResolutionNote}
            </dd>
          </div>
          <div className="grid gap-2">
            <dt className="text-sm font-semibold text-primary">
              {copy.moderation.reporter}
            </dt>
            <dd className="m-0 text-sm text-secondary">
              {report.reporterName}
            </dd>
          </div>
          {report.reviewedAt && (
            <div className="grid gap-2">
              <dt className="text-sm font-semibold text-primary">
                {copy.moderation.reviewedOn}
              </dt>
              <dd className="m-0 text-sm text-secondary">
                <time dateTime={report.reviewedAt}>
                  {formatReportDate(report.reviewedAt)}
                </time>
              </dd>
            </div>
          )}
        </dl>
        <div className="flex justify-end border-t border-secondary pt-5">
          <Button variant="secondary" onClick={onClose}>
            {copy.common.close}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
