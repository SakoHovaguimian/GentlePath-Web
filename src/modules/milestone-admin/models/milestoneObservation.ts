import { z } from 'zod';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { MilestoneResponseOptionSchema } from './milestoneResponseOption';
export const MilestoneObservationSchema = z.object({
  id: z.string(),
  child_id: z.string(),
  milestone_id: z.string(),
  response_option_id: z.string(),
  recorded_by_user_id: z.string().nullable(),
  observed_at: z.string(),
  notes: z.string().nullable(),
  deleted: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  response_option: MilestoneResponseOptionSchema.optional(),
});
export const MilestoneObservationInputSchema = z
  .object({
    child_id: z.string().min(1),
    milestone_id: z.string().min(1),
    response_option_id: z.string().min(1, copy.observationResponseError),
    observed_at: z
      .string()
      .datetime({ offset: true, message: copy.observationDateError })
      .refine(
        (value) => Date.parse(value) <= Date.now(),
        copy.observationDateError,
      ),
    notes: z
      .string()
      .trim()
      .min(1, copy.observationNotesError)
      .max(20000, copy.observationNotesError)
      .nullable(),
  })
  .strict();
export const MilestoneObservationUpdateSchema =
  MilestoneObservationInputSchema.omit({ child_id: true, milestone_id: true });
export type MilestoneObservation = z.infer<typeof MilestoneObservationSchema>;
export type MilestoneObservationInput = z.infer<
  typeof MilestoneObservationInputSchema
>;
