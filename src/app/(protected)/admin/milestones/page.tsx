import type { Metadata } from 'next';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { AdminMilestonesScreen } from '@/modules/milestone-admin/AdminMilestonesScreen';
export const metadata: Metadata = { title: copy.milestonesTitle };
export default function MilestonesPage() {
  return <AdminMilestonesScreen />;
}
