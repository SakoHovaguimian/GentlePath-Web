import { z } from 'zod';
import { USStateCodeSchema } from '@/modules/onboarding/models/usStateCode';
import { StateBenefitCategorySchema } from './stateBenefitCategory';

export const StateBenefitProgramSchema = z.object({
  id: z.string(),
  state_code: USStateCodeSchema,
  name: z.string(),
  description: z.string(),
  benefits: z.array(z.string()),
  qualifications: z.array(z.string()),
  image_url: z.string().url().nullable(),
  program_url: z.string().url(),
  category: StateBenefitCategorySchema,
  is_mock: z.literal(true),
});
export type StateBenefitProgram = z.infer<typeof StateBenefitProgramSchema>;
