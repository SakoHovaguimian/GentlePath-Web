import { z } from 'zod';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { CommercialRelationshipSchema } from './commercialRelationship';
import {
  contentUrl,
  text,
  dateTime,
  lifecycleShape,
  reviewShape,
} from './commercialValidation';
import { SponsorPublicSchema } from './sponsor';
export const DiscountCategorySchema = z.enum([
  'PRODUCTS',
  'SERVICES',
  'ACTIVITIES',
  'EDUCATION',
  'TOOLS',
  'OTHER',
]);
export const DiscountOfferContentSchema = z
  .object({
    commercial_relationship: CommercialRelationshipSchema,
    disclosure_label: text(200),
    affiliate_disclosure: text(2000).nullable(),
    title: text(500),
    description: text(20000),
    category: DiscountCategorySchema,
    discount_label: text(300),
    code: text(300).nullable(),
    landing_url: contentUrl,
    terms_text: text(20000),
    starts_at: dateTime,
    expires_at: dateTime,
  })
  .strict();
const refineOffer = (
  value: z.infer<typeof DiscountOfferContentSchema>,
  ctx: z.RefinementCtx,
) => {
  if (Date.parse(value.expires_at) <= Date.parse(value.starts_at))
    ctx.addIssue({
      code: 'custom',
      path: ['expires_at'],
      message: copy.validation.window,
    });
  if (
    value.commercial_relationship === 'AFFILIATE' &&
    !value.affiliate_disclosure
  )
    ctx.addIssue({
      code: 'custom',
      path: ['affiliate_disclosure'],
      message: copy.validation.affiliate,
    });
};
export const DiscountOfferCreateSchema = DiscountOfferContentSchema.extend({
  sponsor_id: z.string().uuid(),
}).superRefine(refineOffer);
export const DiscountOfferUpdateSchema =
  DiscountOfferContentSchema.superRefine(refineOffer);
export const DiscountOfferSchema = DiscountOfferContentSchema.extend({
  sponsor_id: z.string().uuid(),
  ...lifecycleShape,
  ...reviewShape,
  verification_status: z.enum(['UNVERIFIED', 'VERIFIED', 'FAILED']),
  verified_by_user_id: z.string().uuid().nullable(),
  verified_at: dateTime.nullable(),
  verification_valid_until: dateTime.nullable(),
  verification_source_url: contentUrl.nullable(),
  sponsor: SponsorPublicSchema.nullable().optional(),
}).strip();
export const DiscountOfferPublicSchema = DiscountOfferSchema.omit({
  deleted: true,
  created_at: true,
  updated_at: true,
  review_status: true,
  is_enabled: true,
  reviewed_by_user_id: true,
  reviewed_at: true,
  review_notes: true,
  verification_status: true,
  verified_by_user_id: true,
});
export type DiscountOffer = z.infer<typeof DiscountOfferSchema>;
export type DiscountOfferPublic = z.infer<typeof DiscountOfferPublicSchema>;
export type DiscountOfferCreate = z.infer<typeof DiscountOfferCreateSchema>;
export type DiscountOfferUpdate = z.infer<typeof DiscountOfferUpdateSchema>;
