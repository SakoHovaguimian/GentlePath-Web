import { z } from 'zod';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
export const TipReviewInputSchema = z
  .object({
    approval_status: z.enum(['APPROVED', 'REJECTED'], {
      message: copy.validation.decision,
    }),
    review_notes: z
      .string()
      .trim()
      .min(1, copy.validation.notes)
      .max(10000, copy.validation.notes)
      .nullable(),
  })
  .strict()
  .refine(
    (input) =>
      input.approval_status !== 'REJECTED' || Boolean(input.review_notes),
    {
      message: copy.validation.rejection,
      path: ['review_notes'],
    },
  );
export type TipReviewInput = z.infer<typeof TipReviewInputSchema>;
