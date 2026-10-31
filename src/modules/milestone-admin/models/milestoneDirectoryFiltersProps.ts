import type { MilestoneAdminQuery } from './milestoneAdminQuery';
import type { MilestoneDirectoryUpdates } from './milestoneDirectoryUpdates';

export interface MilestoneDirectoryFiltersProps {
  query: MilestoneAdminQuery;
  onChange: (values: MilestoneDirectoryUpdates) => void;
  tips?: boolean;
  statuses?: boolean;
  milestones?: Array<{ id: string; milestone: string }>;
  tags?: string[];
  progress?: boolean;
  multipleTags?: boolean;
  visibility?: boolean;
}
