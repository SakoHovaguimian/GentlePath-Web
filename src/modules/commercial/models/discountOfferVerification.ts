import { z } from 'zod';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { contentUrl, dateTime } from './commercialValidation';
export const DiscountOfferVerificationSchema = z
  .object({
    verification_status: z.enum(['UNVERIFIED', 'VERIFIED', 'FAILED']),
    verification_valid_until: dateTime.nullable(),
    verification_source_url: contentUrl.nullable(),
  })
  .strict()
  .refine(
    (value) =>
      value.verification_status !== 'VERIFIED' ||
      Boolean(value.verification_valid_until && value.verification_source_url),
    {
      path: ['verification_valid_until'],
      message: copy.validation.verification,
    },
  );
export type DiscountOfferVerification = z.infer<
  typeof DiscountOfferVerificationSchema
>;
