'use client';

import { useQuery } from '@tanstack/react-query';
import { useServiceContainer, useSessionState } from '@/providers/AppProviders';
import { useFamilyPreferences } from '@/modules/onboarding/hooks';

export const stateBenefitsQueryKeys = { all: ['state-benefits'] as const };
export function useStateBenefits() {
  const { stateBenefitsService } = useServiceContainer();
  const { session } = useSessionState();
  const preferences = useFamilyPreferences();
  return useQuery({
    queryKey: [
      ...stateBenefitsQueryKeys.all,
      session?.user.id,
      preferences.data?.state_code,
    ],
    queryFn: ({ signal }) => stateBenefitsService.programs(signal),
    enabled: Boolean(session) && preferences.isSuccess,
  });
}
export function useStateBenefit(id: string) {
  const { stateBenefitsService } = useServiceContainer();
  const { session } = useSessionState();
  const preferences = useFamilyPreferences();
  return useQuery({
    queryKey: [
      ...stateBenefitsQueryKeys.all,
      session?.user.id,
      preferences.data?.state_code,
      id,
    ],
    queryFn: ({ signal }) => stateBenefitsService.program(id, signal),
    enabled: Boolean(session) && preferences.isSuccess,
  });
}
