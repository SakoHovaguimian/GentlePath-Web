import { z } from 'zod';
export const TipReviewDetailsSchema = z.object({
  reviewed_by_user_id: z.string().nullable(),
  reviewed_at: z.string().nullable(),
  review_notes: z.string().nullable(),
});
export type TipReviewDetails = z.infer<typeof TipReviewDetailsSchema>;
