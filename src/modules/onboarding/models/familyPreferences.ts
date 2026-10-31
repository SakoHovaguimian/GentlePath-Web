import { z } from 'zod';
import { USStateCodeSchema } from './usStateCode';
import { DiscoveryApproachSchema } from './discoveryApproach';
import { OnboardingStepSchema } from './onboardingStep';
import { OnboardingChildrenResponseSchema } from './onboardingChildrenResponse';

export const FamilyPreferencesSchema = z.object({
  user_id: z.string().uuid(),
  state_code: USStateCodeSchema.nullable(),
  discovery_approaches: z.array(DiscoveryApproachSchema),
  discovery_preferences_answered: z.boolean(),
  onboarding_step: OnboardingStepSchema,
  onboarding_children_response: OnboardingChildrenResponseSchema.nullable(),
  onboarding_completed_at: z.string().nullable(),
});
export type FamilyPreferences = z.infer<typeof FamilyPreferencesSchema>;
