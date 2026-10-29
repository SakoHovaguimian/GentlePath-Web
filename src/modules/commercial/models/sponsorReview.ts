import { z } from 'zod';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { text } from './commercialValidation';
export const SponsorReviewSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
    review_notes: text(10000).nullable(),
  })
  .strict()
  .refine(
    (value) => value.status === 'APPROVED' || Boolean(value.review_notes),
    { path: ['review_notes'], message: copy.validation.notes },
  );
export type SponsorReview = z.infer<typeof SponsorReviewSchema>;
