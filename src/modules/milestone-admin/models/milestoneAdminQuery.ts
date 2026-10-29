import { z } from 'zod';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { TipApprovalStatusSchema } from './tipApprovalStatus';
export const MilestoneAdminQuerySchema = z.object({
  query: z.string().trim().max(500, copy.validation.invalidQuery).default(''),
  tag: z.string().trim().max(100, copy.validation.invalidQuery).default(''),
  milestone_id: z.string().default(''),
  approval_status: TipApprovalStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().nonnegative().safe().default(0),
});
export type MilestoneAdminQuery = z.infer<typeof MilestoneAdminQuerySchema>;
export function milestoneAdminQueryParams(query: MilestoneAdminQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== '' && value !== undefined) params.set(key, String(value));
  });
  return params.toString();
}
