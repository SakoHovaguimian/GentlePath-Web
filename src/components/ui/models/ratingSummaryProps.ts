export interface RatingSummaryProps {
  average: number | null;
  count: number;
  label: string;
  averageLabel: string;
  countLabel: string;
  emptyLabel: string;
  compact?: boolean;
  className?: string;
}
