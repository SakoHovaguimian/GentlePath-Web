import type { ModerationReport } from './moderationReport';

export interface ModerationReportCardProps {
  report: ModerationReport;
  onOpen: () => void;
}
