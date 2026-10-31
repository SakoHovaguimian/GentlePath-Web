'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServiceContainer, useSessionState } from '@/providers/AppProviders';
import type { OnboardingUpdate } from './models/onboardingUpdate';
import type { ProfilePreferencesUpdate } from './models/profilePreferencesUpdate';

export const onboardingQueryKeys = { all: ['family-preferences'] as const };
export function useFamilyPreferences() {
  const { onboardingService } = useServiceContainer();
  const { session } = useSessionState();
  return useQuery({
    queryKey: [...onboardingQueryKeys.all, session?.user.id],
    queryFn: ({ signal }) => onboardingService.settings(signal),
    enabled: Boolean(session),
  });
}
export function useSaveOnboardingStep() {
  const { onboardingService } = useServiceContainer();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: OnboardingUpdate) => onboardingService.saveStep(input),
    onSuccess: async (data) => {
      cache.setQueryData([...onboardingQueryKeys.all, data.user_id], data);
      await cache.invalidateQueries({ queryKey: ['state-benefits'] });
    },
  });
}
export function useSaveFamilyPreferences() {
  const { onboardingService } = useServiceContainer();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfilePreferencesUpdate) =>
      onboardingService.savePreferences(input),
    onSuccess: async (data) => {
      cache.setQueryData([...onboardingQueryKeys.all, data.user_id], data);
      await cache.invalidateQueries({ queryKey: ['state-benefits'] });
    },
  });
}
