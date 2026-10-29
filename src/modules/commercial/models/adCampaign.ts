import { z } from 'zod';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { CommercialRelationshipSchema } from './commercialRelationship';
import {
  text,
  dateTime,
  lifecycleShape,
  reviewShape,
} from './commercialValidation';
import { SponsorPublicSchema } from './sponsor';
export const AdCampaignContentSchema = z
  .object({
    name: text(300),
    commercial_relationship: CommercialRelationshipSchema,
    starts_at: dateTime,
    ends_at: dateTime.nullable(),
  })
  .strict();
const refineCampaign = (
  value: z.infer<typeof AdCampaignContentSchema>,
  ctx: z.RefinementCtx,
) => {
  if (value.ends_at && Date.parse(value.ends_at) <= Date.parse(value.starts_at))
    ctx.addIssue({
      code: 'custom',
      path: ['ends_at'],
      message: copy.validation.window,
    });
};
export const AdCampaignCreateSchema = AdCampaignContentSchema.extend({
  sponsor_id: z.string().uuid(),
}).superRefine(refineCampaign);
export const AdCampaignUpdateSchema =
  AdCampaignContentSchema.superRefine(refineCampaign);
export const AdCampaignSchema = AdCampaignContentSchema.extend({
  sponsor_id: z.string().uuid(),
  ...lifecycleShape,
  ...reviewShape,
  sponsor: SponsorPublicSchema.nullable().optional(),
}).strip();
export const AdCampaignPublicSchema = AdCampaignSchema.pick({
  id: true,
  sponsor_id: true,
  name: true,
  commercial_relationship: true,
  starts_at: true,
  ends_at: true,
  sponsor: true,
});
export type AdCampaign = z.infer<typeof AdCampaignSchema>;
export type AdCampaignCreate = z.infer<typeof AdCampaignCreateSchema>;
export type AdCampaignUpdate = z.infer<typeof AdCampaignUpdateSchema>;
