import type { ResourceBrowseMode } from './resourceBrowseMode';
import type { ResourceSort } from './resourceSort';

export interface ResourceBrowseFilters {
  mode?: ResourceBrowseMode;
  query: string;
  category: string;
  tag: string;
  sort: ResourceSort;
  savedOnly?: boolean;
}
