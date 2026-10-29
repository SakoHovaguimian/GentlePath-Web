import { z } from 'zod';
export const MilestoneObservationQuerySchema = z.object({
  child_id: z.string().default(''),
  milestone_id: z.string().default(''),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().nonnegative().safe().default(0),
});
export type MilestoneObservationQuery = z.infer<
  typeof MilestoneObservationQuerySchema
>;
