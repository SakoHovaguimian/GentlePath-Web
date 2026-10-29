import { z } from 'zod';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { PublicImageUrlSchema } from './contentUrl';
import { GuideItemSchema, GuideItemInputSchema } from './guideItem';

export const GuideItemsInputSchema = z
  .object({
    items: z
      .array(GuideItemInputSchema)
      .min(1, copy.validation.itemsDescription)
      .max(100, copy.validation.itemsDescription),
  })
  .refine(
    (input) => {
      const ids = input.items.flatMap((item) => (item.id ? [item.id] : []));
      return new Set(ids).size === ids.length;
    },
    { message: copy.validation.itemOwnershipDescription, path: ['items'] },
  );

export const GuideInputSchema = GuideItemsInputSchema.safeExtend({
  title: z
    .string()
    .trim()
    .min(1, copy.validation.titleDescription)
    .max(500, copy.validation.titleDescription),
  description: z
    .string()
    .trim()
    .min(1, copy.validation.descriptionDescription)
    .max(20000, copy.validation.descriptionDescription),
  image_url: PublicImageUrlSchema.nullable(),
});
export const GuideSchema = z.object({
  id: z.string(),
  content_type: z.literal('GUIDED_STEP'),
  title: z.string(),
  description: z.string(),
  image_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  items: z.array(GuideItemSchema).default([]),
});
export type Guide = z.infer<typeof GuideSchema>;
export type GuideInput = z.infer<typeof GuideInputSchema>;
