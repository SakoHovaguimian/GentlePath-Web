import { z } from 'zod';

export const ObservationResponseSchema = z.enum([
  'not_yet',
  'emerging',
  'often',
  'stopped',
]);
export const ObservationInputSchema = z.object({
  response: ObservationResponseSchema,
  childId: z.string().min(1),
});
export const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  response: ObservationResponseSchema.nullable(),
  observedAt: z.string().datetime().nullable(),
});
export type Milestone = z.infer<typeof MilestoneSchema>;
export type ObservationInput = z.infer<typeof ObservationInputSchema>;
