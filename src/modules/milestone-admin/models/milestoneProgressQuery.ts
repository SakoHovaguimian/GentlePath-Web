import { z } from 'zod';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';

export const MilestoneProgressQuerySchema = z.object({
  child_id: z.string().min(1, copy.validation.invalidQuery),
});

export type MilestoneProgressQuery = z.infer<
  typeof MilestoneProgressQuerySchema
>;
