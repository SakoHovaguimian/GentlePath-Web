import type { AgeBand } from '../../models/ageBand';
import type { USStateCode } from '@/modules/onboarding/models/usStateCode';
import type { CommunityPostInput } from '../../models/communityPost';

export interface DemoCommunityPost extends Omit<CommunityPostInput, 'childId'> {
  stateCode: USStateCode | null;
  ageBand: AgeBand | null;
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  hidden: boolean;
}
