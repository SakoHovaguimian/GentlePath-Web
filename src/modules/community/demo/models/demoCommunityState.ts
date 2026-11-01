import type { DemoCommunityPost } from './demoCommunityPost';
import type { DemoCommunityComment } from './demoCommunityComment';
import type { DemoCommunityReport } from './demoCommunityReport';

export interface DemoCommunityState {
  fixtureVersion?: number;
  posts: DemoCommunityPost[];
  comments: DemoCommunityComment[];
  postLikes: Map<string, Set<string>>;
  commentLikes: Map<string, Set<string>>;
  reports: DemoCommunityReport[];
}
