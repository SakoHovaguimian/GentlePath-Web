import { z } from 'zod';
import { gentlePathOnboardingStrings as copy } from '@/strings';
import { DiscoveryApproachSchema } from './discoveryApproach';

export const DiscoveryPreferencesInputSchema = z
  .object({
    approaches: z.array(DiscoveryApproachSchema).max(5),
    no_preference: z.boolean(),
  })
  .strict()
  .refine(
    (input) =>
      input.no_preference
        ? input.approaches.length === 0
        : input.approaches.length > 0,
    { message: copy.invalidSelection },
  )
  .refine(
    (input) => new Set(input.approaches).size === input.approaches.length,
    { message: copy.duplicateSelection },
  );
export type DiscoveryPreferencesInput = z.infer<
  typeof DiscoveryPreferencesInputSchema
>;
