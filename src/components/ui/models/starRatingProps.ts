export interface StarRatingProps {
  value: number | null;
  onValueChange: (value: number) => void;
  label: string;
  valueLabel: string;
  getOptionLabel: (value: number) => string;
  describedBy?: string;
  disabled?: boolean;
  busy?: boolean;
}
