import type { CommunityReportSnapshot } from '../../models/communityReportSnapshot';

export interface DemoCommunityReport {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'post' | 'post_comment';
  snapshot: CommunityReportSnapshot;
}
