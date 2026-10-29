import { z } from 'zod';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { CommercialRelationshipSchema } from './commercialRelationship';
import {
  publicContentUrl,
  contentUrl,
  text,
  lifecycleShape,
  reviewShape,
} from './commercialValidation';
import { SponsorPublicSchema } from './sponsor';
import { AdCampaignPublicSchema } from './adCampaign';
import { DiscountOfferPublicSchema } from './discountOffer';
export const AdPlatformSchema = z.enum(['IOS', 'ANDROID', 'WEB']);
export const AdLocaleSchema = text(64)
  .min(2)
  .refine((value) => {
    try {
      return Intl.getCanonicalLocales(value).length === 1;
    } catch {
      return false;
    }
  }, copy.validation.locale)
  .transform((value) => Intl.getCanonicalLocales(value)[0]!);
export const AdActionTypeSchema = z.enum([
  'OPEN_EXTERNAL_BROWSER',
  'OPEN_IN_APP_BROWSER',
  'OPEN_DEEP_LINK',
  'OPEN_APP_ROUTE',
  'COPY_DISCOUNT_CODE',
]);
export const AdLayoutSchema = z.enum([
  'IMAGE_BANNER',
  'COMPACT_CARD',
  'FEATURE_CARD',
]);
const appRoute =
  /^\/(?:resources|guided-steps|blogs|posts|polls|milestones|family-discounts)(?:\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})?$/;
export function validCreativeAction(type: string, value: string | null) {
  if (!value) return false;
  if (type === 'OPEN_APP_ROUTE') return appRoute.test(value);
  if (type === 'OPEN_DEEP_LINK') {
    try {
      const url = new URL(value);
      return (
        value.startsWith('gentlepath://') &&
        !/[\u0000-\u0020\u007f\\]/.test(value) &&
        !url.username &&
        !url.password &&
        !url.port &&
        !url.search &&
        !url.hash &&
        appRoute.test(
          `${url.hostname ? '/' + url.hostname : ''}${url.pathname}`,
        )
      );
    } catch {
      return false;
    }
  }
  return contentUrl.safeParse(value).success;
}
const color = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?$/, copy.validation.color)
  .nullable();
export const AdCreativeContentSchema = z
  .object({
    discount_offer_id: z.string().uuid().nullable(),
    title: text(120),
    subtitle: text(240).nullable(),
    image_url: publicContentUrl.nullable(),
    image_alt_text: text(1000).nullable(),
    layout: AdLayoutSchema,
    image_fit: z.enum(['COVER', 'CONTAIN']),
    background_color: color,
    tint_color: color,
    title_color: color,
    subtitle_color: color,
    button_tint_color: color,
    button_text_color: color,
    disclosure_label: text(200),
    affiliate_disclosure: text(2000).nullable(),
    action_title: text(60),
    action_type: AdActionTypeSchema,
    action_value: text(1000).nullable(),
    locale: AdLocaleSchema,
    supported_platforms: z
      .array(AdPlatformSchema)
      .min(1, copy.validation.platforms)
      .max(3),
  })
  .strict();
const refineCreative = (
  value: z.infer<typeof AdCreativeContentSchema>,
  ctx: z.RefinementCtx,
) => {
  if (
    new Set(value.supported_platforms).size !== value.supported_platforms.length
  )
    ctx.addIssue({
      code: 'custom',
      path: ['supported_platforms'],
      message: copy.validation.platforms,
    });
  if (
    (value.image_url && !value.image_alt_text) ||
    (value.layout === 'IMAGE_BANNER' && !value.image_url)
  )
    ctx.addIssue({
      code: 'custom',
      path: [value.image_url ? 'image_alt_text' : 'image_url'],
      message: copy.validation.image,
    });
  if (
    value.action_type === 'COPY_DISCOUNT_CODE'
      ? !value.discount_offer_id || value.action_value !== null
      : !validCreativeAction(value.action_type, value.action_value)
  )
    ctx.addIssue({
      code: 'custom',
      path: ['action_value'],
      message: copy.validation.action,
    });
};
export const AdCreativeCreateSchema = AdCreativeContentSchema.extend({
  campaign_id: z.string().uuid(),
}).superRefine(refineCreative);
export const AdCreativeUpdateSchema =
  AdCreativeContentSchema.superRefine(refineCreative);
export const AdCreativeSchema = AdCreativeContentSchema.extend({
  campaign_id: z.string().uuid(),
  sponsor_id: z.string().uuid(),
  ...lifecycleShape,
  ...reviewShape,
  commercial_relationship: CommercialRelationshipSchema.optional(),
  campaign: AdCampaignPublicSchema.nullable().optional(),
  sponsor: SponsorPublicSchema.nullable().optional(),
  discount_offer: DiscountOfferPublicSchema.nullable().optional(),
}).strip();
export const AdCreativePublicSchema = AdCreativeSchema.omit({
  deleted: true,
  created_at: true,
  updated_at: true,
  review_status: true,
  is_enabled: true,
  reviewed_by_user_id: true,
  reviewed_at: true,
  review_notes: true,
});
export type AdCreative = z.infer<typeof AdCreativeSchema>;
export type AdCreativePublic = z.infer<typeof AdCreativePublicSchema>;
export type AdCreativeCreate = z.infer<typeof AdCreativeCreateSchema>;
export type AdCreativeUpdate = z.infer<typeof AdCreativeUpdateSchema>;
