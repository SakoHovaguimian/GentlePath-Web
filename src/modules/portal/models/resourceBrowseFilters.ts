import type { ResourceBrowseMode } from './resourceBrowseMode';
import type { ResourceSort } from './resourceSort';

export interface ResourceBrowseFilters {
  mode?: ResourceBrowseMode;
  stateCode?: string;
  query: string;
  category: string;
  tag: string;
  sort: ResourceSort;
  savedOnly?: boolean;
}
