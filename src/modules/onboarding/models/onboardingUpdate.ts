import { z } from 'zod';
import { USStateCodeSchema } from './usStateCode';
import { OnboardingChildrenResponseSchema } from './onboardingChildrenResponse';
import { DiscoveryPreferencesInputSchema } from './discoveryPreferencesInput';

export const OnboardingUpdateSchema = z.discriminatedUnion('step', [
  z
    .object({ step: z.literal('STATE'), state_code: USStateCodeSchema })
    .strict(),
  z
    .object({
      step: z.literal('CHILDREN'),
      response: OnboardingChildrenResponseSchema,
    })
    .strict(),
  z
    .object({
      step: z.literal('DISCOVERY'),
      discovery: DiscoveryPreferencesInputSchema,
    })
    .strict(),
  z.object({ step: z.literal('FINISH') }).strict(),
]);
export type OnboardingUpdate = z.infer<typeof OnboardingUpdateSchema>;
