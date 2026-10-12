'use client';

import type { SegmentedTabsProps } from '../models/segmentedTabsProps';
import { SegmentedTabs } from './Tabs';

// Section destinations and ordinary segmented controls share one responsive rule.
export function ResponsiveSectionNavigation<T extends string>(
  props: SegmentedTabsProps<T> & { label: string },
) {
  return <SegmentedTabs {...props} />;
}
