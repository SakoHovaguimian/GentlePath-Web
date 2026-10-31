import { PublicImageReferenceSchema } from '@/models/publicImageUrl';
import { normalizeContentTag } from '@/utils/normalizeContentTag';
import { z } from 'zod';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import {
  MilestoneResponseOptionSchema,
  MilestoneResponseOptionInputSchema,
} from './milestoneResponseOption';

export const MilestoneGuidanceSchema = z.object({
  id: z.string().min(1),
  content_type: z.literal('MILESTONE'),
  milestone: z.string(),
  image_url: z.string().nullable().default(null),
  information: z.string(),
  observation_guidance: z.string().nullable(),
  tags: z.array(z.string().transform(normalizeContentTag)),
  created_at: z.string(),
  updated_at: z.string(),
  response_options: z.array(MilestoneResponseOptionSchema).optional(),
  approved_tip_count: z.number().int().nonnegative().optional(),
});
export const MilestoneGuidanceInputSchema = z
  .object({
    image_url: PublicImageReferenceSchema.nullable().optional(),
    milestone: z
      .string()
      .trim()
      .min(1, copy.validation.milestone)
      .max(500, copy.validation.milestone),
    information: z
      .string()
      .trim()
      .min(1, copy.validation.information)
      .max(20000, copy.validation.information),
    observation_guidance: z
      .string()
      .trim()
      .min(1, copy.validation.guidance)
      .max(20000, copy.validation.guidance)
      .nullable(),
    tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, copy.validation.tags)
          .max(100, copy.validation.tags)
          .transform(normalizeContentTag)
          .refine((tag) => tag.length <= 100, copy.validation.tags),
      )
      .max(30, copy.validation.tags)
      .refine(
        (tags) =>
          new Set(tags.map((tag) => tag.toLocaleLowerCase('en-US'))).size ===
          tags.length,
        copy.validation.tags,
      ),
    response_options: z
      .array(MilestoneResponseOptionInputSchema)
      .max(100, copy.validation.options)
      .refine(
        (options) =>
          new Set(options.map((option) => option.value)).size ===
            options.length &&
          new Set(options.flatMap((option) => (option.id ? [option.id] : [])))
            .size === options.filter((option) => option.id).length,
        copy.validation.options,
      ),
  })
  .strict();
export type MilestoneGuidance = z.infer<typeof MilestoneGuidanceSchema>;
export type MilestoneGuidanceInput = z.infer<
  typeof MilestoneGuidanceInputSchema
>;
