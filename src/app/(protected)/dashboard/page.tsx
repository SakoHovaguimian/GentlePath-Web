import type { Metadata } from 'next';
import { gentlePathPortalStrings as copy } from '@/strings';
import { FamilyDashboardScreen } from '@/modules/portal/FamilyDashboardScreen';

export const metadata: Metadata = { title: copy.navigation.home };
export default function GentlePathPage() {
  return <FamilyDashboardScreen />;
}
