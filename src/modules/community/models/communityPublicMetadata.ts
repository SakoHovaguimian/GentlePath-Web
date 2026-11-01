import { z } from 'zod';
import { USStateCodeSchema } from '@/modules/onboarding/models/usStateCode';
import { MilestoneLinksSchema } from '@/modules/milestone-admin/models/milestoneLinks';
import { PostKindSchema } from './postKind';
import { AgeBandSchema } from './ageBand';

/** Public evidence shared by saved targets and reports; no child provenance. */
export const CommunityPublicMetadataSchema = z.object({
  milestoneIds: MilestoneLinksSchema.optional(),
  postKind: PostKindSchema.optional(),
  stateCode: USStateCodeSchema.nullable().optional(),
  ageBand: AgeBandSchema.nullable().optional(),
  stateCodes: z.array(USStateCodeSchema).optional(),
  officialSourceUrl: z.string().url().nullable().optional(),
  verifiedAt: z.string().nullable().optional(),
});
