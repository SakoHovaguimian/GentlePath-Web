import type { Metadata } from 'next';
import { gentlePathOnboardingStrings as copy } from '@/strings';
import { FamilyPreferencesScreen } from '@/modules/onboarding/FamilyPreferencesScreen';

export const metadata: Metadata = { title: copy.preferencesTitle };
export default function FamilyPreferencesPage() {
  return <FamilyPreferencesScreen />;
}
