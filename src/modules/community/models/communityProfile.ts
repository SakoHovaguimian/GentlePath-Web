import { z } from 'zod';
import { UserRoleTransportSchema } from '@/services/api/models/userRoleTransport';
import { mapUserRoleTransport } from '@/services/api/mapUserRoleTransport';
import { UserRoleSchema } from '@/models/userRole';
import { CommunityActivityCountsSchema } from './communityActivityCounts';

export const CommunityProfileSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  role: UserRoleTransportSchema.transform(mapUserRoleTransport).pipe(
    UserRoleSchema,
  ),
  child_count: z.number().int().nonnegative(),
  child_ages: z.array(z.number().int().nonnegative()),
  activity_counts: CommunityActivityCountsSchema,
});
export type CommunityProfile = z.infer<typeof CommunityProfileSchema>;
