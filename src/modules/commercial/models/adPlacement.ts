import { z } from 'zod';
import { text, lifecycleShape } from './commercialValidation';
import {
  AdPlacementItemSchema,
  AdPlacementItemPublicSchema,
} from './adPlacementItem';
export const AdPlacementKeySchema = z.enum([
  'HOME_CAROUSEL',
  'FAMILY_DISCOUNTS_CAROUSEL',
]);
export const AdPlacementCreateSchema = z
  .object({
    key: AdPlacementKeySchema,
    name: text(300),
    max_items: z.number().int().min(1).max(10).default(5),
    auto_advance_seconds: z
      .number()
      .int()
      .min(3)
      .max(60)
      .nullable()
      .default(null),
    show_pagination: z.boolean().default(true),
  })
  .strict();
export const AdPlacementUpdateSchema = AdPlacementCreateSchema.omit({
  key: true,
})
  .extend({
    is_enabled: z.boolean(),
    max_items: z.number().int().min(1).max(10),
    auto_advance_seconds: z.number().int().min(3).max(60).nullable(),
    show_pagination: z.boolean(),
  })
  .strict();
export const AdPlacementSchema = AdPlacementUpdateSchema.extend({
  key: AdPlacementKeySchema,
  ...lifecycleShape,
  items: z.array(AdPlacementItemSchema).optional(),
}).strip();
export const AdPlacementPublicSchema = AdPlacementSchema.omit({
  deleted: true,
  created_at: true,
  updated_at: true,
  is_enabled: true,
  items: true,
}).extend({ items: z.array(AdPlacementItemPublicSchema) });
export type AdPlacement = z.infer<typeof AdPlacementSchema>;
export type AdPlacementPublic = z.infer<typeof AdPlacementPublicSchema>;
export type AdPlacementKey = z.infer<typeof AdPlacementKeySchema>;
export type AdPlacementCreate = z.infer<typeof AdPlacementCreateSchema>;
export type AdPlacementUpdate = z.infer<typeof AdPlacementUpdateSchema>;
