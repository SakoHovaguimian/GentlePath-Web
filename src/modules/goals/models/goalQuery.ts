import { ChildProfileSchema } from '@/modules/portal/models/childProfile';
import { z } from 'zod';
import { GoalStatusSchema } from './goalStatus';

export const GoalQuerySchema = z.object({
  query: z.string().trim().max(500).default(''),
  child_id: ChildProfileSchema.shape.id.min(1).optional(),
  status: GoalStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  offset: z.coerce
    .number()
    .int()
    .nonnegative()
    .max(Number.MAX_SAFE_INTEGER)
    .default(0),
});
export type GoalQuery = z.infer<typeof GoalQuerySchema>;
