import { normalizeContentTag } from '@/utils/normalizeContentTag';
import { z } from 'zod';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { TipApprovalStatusSchema } from './tipApprovalStatus';
import { MilestoneProgressStateSchema } from './milestoneProgressState';
export const MilestoneAdminQuerySchema = z.object({
  query: z.string().trim().max(500, copy.validation.invalidQuery).default(''),
  tag: z
    .string()
    .trim()
    .max(100, copy.validation.invalidQuery)
    .default('')
    .transform(normalizeContentTag),
  milestone_id: z.string().default(''),
  child_id: z.string().min(1, copy.validation.invalidQuery).optional(),
  progress: z
    .string()
    .max(200, copy.validation.invalidQuery)
    .refine(
      (value) =>
        value
          .split(',')
          .every(
            (state) => MilestoneProgressStateSchema.safeParse(state).success,
          ),
      copy.validation.invalidQuery,
    )
    .optional(),
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
