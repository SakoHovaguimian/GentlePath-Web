import { z } from 'zod';

const CountSchema = z.number().int().nonnegative();

export const MilestoneProgressSummarySchema = z.object({
  total: CountSchema,
  answered: CountSchema,
  unanswered: CountSchema,
  counts: z.object({
    unrecorded: CountSchema,
    not_yet: CountSchema,
    emerging: CountSchema,
    often: CountSchema,
    stopped: CountSchema,
    other: CountSchema,
  }),
});

export type MilestoneProgressSummary = z.infer<
  typeof MilestoneProgressSummarySchema
>;
