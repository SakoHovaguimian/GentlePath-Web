import { z } from 'zod';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';

export const MilestoneResponseOptionSchema = z.object({
  id: z.string().min(1),
  milestone_id: z.string().min(1),
  value: z.string(),
  label: z.string(),
  position: z.number().int().nonnegative(),
  deleted: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export const MilestoneResponseOptionInputSchema = z
  .object({
    id: z.string().min(1).optional(),
    value: z
      .string()
      .trim()
      .min(1, copy.validation.optionValue)
      .max(500, copy.validation.optionValue),
    label: z
      .string()
      .trim()
      .min(1, copy.validation.optionLabel)
      .max(500, copy.validation.optionLabel),
  })
  .strict();
export type MilestoneResponseOption = z.infer<
  typeof MilestoneResponseOptionSchema
>;
export type MilestoneResponseOptionInput = z.infer<
  typeof MilestoneResponseOptionInputSchema
>;
