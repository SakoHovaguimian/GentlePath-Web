import type { SegmentedTab } from './segmentedTab';

export type SegmentedTabsProps<T extends string> = {
  tabs: Array<SegmentedTab<T>>;
  value: T;
  onValueChange: (value: T) => void;
  label?: string;
  disabled?: boolean;
};
