import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import { FamilyPreferencesSchema } from '../models/familyPreferences';
import {
  OnboardingUpdateSchema,
  type OnboardingUpdate,
} from '../models/onboardingUpdate';
import {
  ProfilePreferencesUpdateSchema,
  type ProfilePreferencesUpdate,
} from '../models/profilePreferencesUpdate';

export class OnboardingService {
  constructor(private readonly api: ApiClientInterface) {}

  async settings(signal?: AbortSignal) {
    return FamilyPreferencesSchema.parse(
      await this.api.request('/portal/onboarding', { signal }),
    );
  }
  async saveStep(input: OnboardingUpdate) {
    return FamilyPreferencesSchema.parse(
      await this.api.request('/portal/onboarding', {
        method: 'PUT',
        body: validateInput(OnboardingUpdateSchema, input),
      }),
    );
  }
  async savePreferences(input: ProfilePreferencesUpdate) {
    return FamilyPreferencesSchema.parse(
      await this.api.request('/portal/family-preferences', {
        method: 'PUT',
        body: validateInput(ProfilePreferencesUpdateSchema, input),
      }),
    );
  }
}
