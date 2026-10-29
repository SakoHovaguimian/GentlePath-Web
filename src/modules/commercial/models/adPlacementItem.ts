import { z } from 'zod';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { dateTime, lifecycleShape } from './commercialValidation';
import { AdCreativePublicSchema } from './adCreative';
export const AdPlacementItemContentSchema = z
  .object({
    creative_id: z.string().uuid(),
    is_enabled: z.boolean(),
    starts_at: dateTime.nullable(),
    ends_at: dateTime.nullable(),
  })
  .strict();
export const AdPlacementItemInputSchema = AdPlacementItemContentSchema.extend({
  id: z.string().uuid().optional(),
}).superRefine((value, ctx) => {
  if (
    value.starts_at &&
    value.ends_at &&
    Date.parse(value.ends_at) <= Date.parse(value.starts_at)
  )
    ctx.addIssue({
      code: 'custom',
      path: ['ends_at'],
      message: copy.validation.window,
    });
});
export const AdPlacementItemSchema = AdPlacementItemContentSchema.extend({
  ...lifecycleShape,
  placement_id: z.string().uuid(),
  position: z.number().int().nonnegative(),
  creative: AdCreativePublicSchema.nullable().optional(),
}).strip();
export const AdPlacementItemPublicSchema = AdPlacementItemSchema.pick({
  id: true,
  placement_id: true,
  creative_id: true,
  position: true,
  creative: true,
});
export const AdPlacementItemsSchema = z
  .object({
    items: z
      .array(AdPlacementItemInputSchema)
      .max(50)
      .refine(
        (items) =>
          new Set(items.map((item) => item.creative_id)).size === items.length,
        copy.validation.items,
      ),
  })
  .strict();
export const AdPlacementOrderSchema = z
  .object({
    item_ids: z
      .array(z.string().uuid())
      .max(50)
      .refine((ids) => new Set(ids).size === ids.length, copy.validation.items),
  })
  .strict();
export type AdPlacementItem = z.infer<typeof AdPlacementItemSchema>;
export type AdPlacementItemInput = z.infer<typeof AdPlacementItemInputSchema>;
export type AdPlacementItemPublic = z.infer<typeof AdPlacementItemPublicSchema>;
