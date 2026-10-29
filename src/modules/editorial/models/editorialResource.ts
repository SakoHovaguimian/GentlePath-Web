import { normalizeContentTag } from '@/utils/normalizeContentTag';
import { z } from 'zod';
import { ResourceRatingSummarySchema } from '@/modules/engagement/models/resourceRatingSummary';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { ContentUrlSchema } from './contentUrl';
import { EditorialResourceTypeSchema } from './resourceType';
import { EditorialResourceFormatSchema } from './resourceFormat';
import {
  EditorialResourceDetailsSchema,
  ResourceDetailsInputSchema,
} from './resourceDetails';

export const EditorialResourceSchema = z.object({
  id: z.string(),
  content_type: z.literal('RESOURCE'),
  parent_id: z.string().nullable(),
  type: EditorialResourceTypeSchema,
  format: EditorialResourceFormatSchema.nullable(),
  tags: z.array(z.string().transform(normalizeContentTag)).default([]),
  title: z.string(),
  url: z.string().nullable(),
  description: z.string(),
  resource_details: EditorialResourceDetailsSchema,
  created_at: z.string(),
  updated_at: z.string(),
  ratings: ResourceRatingSummarySchema.optional(),
  children_count: z.number().optional(),
});

export const EditorialResourceInputSchema = z
  .object({
    parent_id: z.uuid(copy.validation.parentDescription).nullable(),
    type: EditorialResourceTypeSchema,
    format: EditorialResourceFormatSchema.nullable(),
    tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, copy.validation.tagsDescription)
          .max(100, copy.validation.tagsDescription)
          .transform(normalizeContentTag)
          .refine((tag) => tag.length <= 100, copy.validation.tagsDescription),
      )
      .max(30, copy.validation.tagsDescription),
    title: z
      .string()
      .trim()
      .min(1, copy.validation.titleDescription)
      .max(500, copy.validation.titleDescription),
    url: ContentUrlSchema.nullable(),
    description: z
      .string()
      .trim()
      .min(1, copy.validation.descriptionDescription)
      .max(20000, copy.validation.descriptionDescription),
    resource_details: ResourceDetailsInputSchema,
  })
  .superRefine((input, context) => {
    if (input.type !== 'COLLECTION') {
      if (!input.resource_details.source_name)
        context.addIssue({
          code: 'custom',
          message: copy.validation.sourceRequiredDescription,
          path: ['resource_details', 'source_name'],
        });
      if (!input.resource_details.source_url)
        context.addIssue({
          code: 'custom',
          message: copy.validation.sourceRequiredDescription,
          path: ['resource_details', 'source_url'],
        });
    }
    if (
      new Set(input.tags.map((tag) => tag.toLocaleLowerCase('en-US'))).size !==
      input.tags.length
    )
      context.addIssue({
        code: 'custom',
        message: copy.validation.tagsDescription,
        path: ['tags'],
      });
    if (
      input.resource_details.source_published_at &&
      input.resource_details.source_published_at >
        new Date().toISOString().slice(0, 10)
    )
      context.addIssue({
        code: 'custom',
        message: copy.validation.dateDescription,
        path: ['resource_details', 'source_published_at'],
      });
  });
export type EditorialResource = z.infer<typeof EditorialResourceSchema>;
export type EditorialResourceInput = z.infer<
  typeof EditorialResourceInputSchema
>;
