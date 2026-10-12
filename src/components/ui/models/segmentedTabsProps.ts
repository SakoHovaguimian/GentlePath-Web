import type { SegmentedTab } from './segmentedTab';

export interface SegmentedTabsProps<T extends string> {
  tabs: Array<SegmentedTab<T>>;
  value: T;
  onValueChange: (value: T) => void;
  label?: string;
  disabled?: boolean;
}
