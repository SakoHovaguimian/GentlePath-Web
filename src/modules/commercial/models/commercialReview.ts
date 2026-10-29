import { z } from 'zod';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { text } from './commercialValidation';
export const CommercialReviewSchema = z
  .object({
    review_status: z.enum(['APPROVED', 'REJECTED']),
    review_notes: text(10000).nullable(),
  })
  .strict()
  .refine(
    (value) =>
      value.review_status !== 'REJECTED' || Boolean(value.review_notes),
    { path: ['review_notes'], message: copy.validation.notes },
  );
export type CommercialReview = z.infer<typeof CommercialReviewSchema>;
