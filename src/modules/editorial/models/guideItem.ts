import { z } from 'zod';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { ContentMetadataSchema } from './contentMetadata';
import { PublicImageUrlSchema } from './contentUrl';

export const GuideItemInputSchema = z.object({
  id: z.uuid().optional(),
  title: z
    .string()
    .trim()
    .min(1, copy.validation.titleDescription)
    .max(500, copy.validation.titleDescription)
    .nullable(),
  description: z
    .string()
    .trim()
    .min(1, copy.validation.descriptionDescription)
    .max(20000, copy.validation.descriptionDescription),
  image_url: PublicImageUrlSchema.nullable(),
  additional_properties: ContentMetadataSchema.default({}),
});
export const GuideItemSchema = GuideItemInputSchema.extend({
  id: z.string(),
  guided_step_id: z.string(),
  position: z.number().int().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type GuideItem = z.infer<typeof GuideItemSchema>;
export type GuideItemInput = z.infer<typeof GuideItemInputSchema>;

export type GuideStepContent = Pick<
  GuideItem,
  'id' | 'title' | 'description' | 'image_url' | 'position'
>;
