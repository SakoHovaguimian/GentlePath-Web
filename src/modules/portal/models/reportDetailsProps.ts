import type { ModerationReport } from './moderationReport';

export interface ReportDetailsProps {
  report: ModerationReport;
  onClose: () => void;
}
