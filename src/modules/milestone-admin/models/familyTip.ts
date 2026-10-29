import { z } from 'zod';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { TipApprovalStatusSchema } from './tipApprovalStatus';
import { TipReviewDetailsSchema } from './tipReviewDetails';
import { TipPublicAuthorSchema } from './tipPublicAuthor';
export const FamilyTipSchema = z.object({
  id: z.string().min(1),
  content_type: z.literal('TIP'),
  milestone_id: z.string(),
  user_id: z.string().nullable(),
  message: z.string(),
  approval_status: TipApprovalStatusSchema,
  author: TipPublicAuthorSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  review: TipReviewDetailsSchema.optional(),
});
export const FamilyTipInputSchema = z
  .object({
    milestone_id: z.string().trim().min(1, copy.validation.milestoneRequired),
    message: z
      .string()
      .trim()
      .min(1, copy.validation.message)
      .max(20000, copy.validation.message),
  })
  .strict();
export const FamilyTipUpdateSchema = FamilyTipInputSchema.pick({
  message: true,
});
export type FamilyTip = z.infer<typeof FamilyTipSchema>;
export type FamilyTipInput = z.infer<typeof FamilyTipInputSchema>;
