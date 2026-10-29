import { z } from 'zod';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { ContentMetadataSchema } from './contentMetadata';
import { ContentUrlSchema } from './contentUrl';

export const ResourceDetailsInputSchema = z.object({
  source_name: z
    .string()
    .trim()
    .min(1)
    .max(300, copy.validation.sourceNameDescription)
    .nullable()
    .default(null),
  source_url: ContentUrlSchema.nullable().default(null),
  source_published_at: z.iso
    .date(copy.validation.dateDescription)
    .nullable()
    .default(null),
  additional_properties: ContentMetadataSchema.default({}),
});
export const EditorialResourceDetailsSchema = ResourceDetailsInputSchema.extend(
  {
    reviewed_at: z.string(),
    reviewed_by_user_id: z.string(),
  },
);
export type ResourceDetailsInput = z.infer<typeof ResourceDetailsInputSchema>;
export type EditorialResourceDetails = z.infer<
  typeof EditorialResourceDetailsSchema
>;
