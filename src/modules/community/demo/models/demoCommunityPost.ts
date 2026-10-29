import type { CommunityPostInput } from '../../models/communityPost';

export interface DemoCommunityPost extends CommunityPostInput {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  hidden: boolean;
}
