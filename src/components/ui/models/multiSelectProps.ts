import type { AriaAttributes, Ref } from 'react';

export interface MultiSelectProps<Value extends string> {
  value: readonly Value[];
  options: readonly { value: Value; label: string }[];
  onValueChange: (value: Value[]) => void;
  label: string;
  placeholder: string;
  selectionLabel: (count: number, labels: readonly string[]) => string;
  clearLabel: string;
  className?: string;
  disabled?: boolean;
  selectAllLabel?: string;
  maxSelections?: number;
  id?: string;
  ref?: Ref<HTMLButtonElement>;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
}
