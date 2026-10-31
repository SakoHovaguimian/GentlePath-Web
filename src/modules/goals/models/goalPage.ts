import { z } from 'zod';
import { GoalSchema } from './goal';
export const GoalPageSchema = z.object({
  data: z.array(GoalSchema),
  page: z.object({
    limit: z.number().int().min(1).max(100),
    offset: z.number().int().nonnegative(),
    hasMore: z.boolean(),
    nextOffset: z.number().int().nonnegative().nullable(),
  }),
});
