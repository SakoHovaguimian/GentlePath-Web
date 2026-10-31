import { z } from 'zod';

export const OnboardingStepSchema = z.enum([
  'STATE',
  'CHILDREN',
  'DISCOVERY',
  'FINISH',
  'COMPLETE',
]);
export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;
