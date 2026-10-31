import { z } from 'zod';

export const StateBenefitCategorySchema = z.enum([
  'HEALTHCARE',
  'EARLY_SUPPORT',
  'FAMILY_SUPPORT',
]);
export type StateBenefitCategory = z.infer<typeof StateBenefitCategorySchema>;
