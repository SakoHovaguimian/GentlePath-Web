import type { ReactNode } from 'react';
import type { SegmentedTab } from './segmentedTab';

export type SegmentedPanel<T extends string> = Omit<
  SegmentedTab<T>,
  'panelId'
> & {
  content: ReactNode;
};
