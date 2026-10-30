export interface DatePickerProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
  id?: string;
  max?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}
