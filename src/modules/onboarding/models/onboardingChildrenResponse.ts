import { z } from 'zod';

export const OnboardingChildrenResponseSchema = z.enum(['ADDED', 'LATER']);
export type OnboardingChildrenResponse = z.infer<
  typeof OnboardingChildrenResponseSchema
>;
