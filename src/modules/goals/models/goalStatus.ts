import { z } from 'zod';

export const GoalStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']);

export type GoalStatus = z.infer<typeof GoalStatusSchema>;
