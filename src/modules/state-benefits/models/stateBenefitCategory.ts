import { z } from 'zod';

export const StateBenefitCategorySchema = z.enum([
  'MEDICAID_WAIVERS',
  'RESPITE',
  'EARLY_INTERVENTION',
  'SCHOOL_SUPPORT',
  'DISABILITY_SERVICES',
]);
export type StateBenefitCategory = z.infer<typeof StateBenefitCategorySchema>;
