import type { Metadata } from 'next';
import { gentlePathOnboardingStrings as copy } from '@/strings';
import { OnboardingScreen } from '@/modules/onboarding/OnboardingScreen';

export const metadata: Metadata = { title: copy.title };
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  return <OnboardingScreen redirectTo={redirectTo} />;
}
