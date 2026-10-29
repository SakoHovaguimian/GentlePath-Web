import type { Metadata } from 'next';
import { gentlePathPortalStrings as copy } from '@/strings';
import { MilestonesScreen } from '@/modules/portal/MilestonesScreen';

export const metadata: Metadata = { title: copy.navigation.milestones };
export default function GentlePathPage() {
  return <MilestonesScreen />;
}
