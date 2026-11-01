import { z } from 'zod';
import { USStateCodeSchema } from '@/modules/onboarding/models/usStateCode';
import { MilestoneLinksSchema } from '@/modules/milestone-admin/models/milestoneLinks';
import { PostKindSchema } from '../../models/postKind';
import { AgeBandSchema } from '../../models/ageBand';

export const CommunityPublicMetadataTransportSchema = z.object({
  milestone_ids: MilestoneLinksSchema.optional(),
  post_kind: PostKindSchema.optional(),
  state_code: USStateCodeSchema.nullable().optional(),
  age_band: AgeBandSchema.nullable().optional(),
  state_codes: z.array(USStateCodeSchema).optional(),
  official_source_url: z.string().url().nullable().optional(),
  verified_at: z.string().nullable().optional(),
});
export function mapCommunityPublicMetadata(
  value: z.infer<typeof CommunityPublicMetadataTransportSchema>,
) {
  return {
    ...(value.milestone_ids !== undefined
      ? { milestoneIds: value.milestone_ids }
      : {}),
    ...(value.post_kind !== undefined ? { postKind: value.post_kind } : {}),
    ...(value.state_code !== undefined ? { stateCode: value.state_code } : {}),
    ...(value.age_band !== undefined ? { ageBand: value.age_band } : {}),
    ...(value.state_codes !== undefined
      ? { stateCodes: value.state_codes }
      : {}),
    ...(value.official_source_url !== undefined
      ? { officialSourceUrl: value.official_source_url }
      : {}),
    ...(value.verified_at !== undefined
      ? { verifiedAt: value.verified_at }
      : {}),
  };
}
