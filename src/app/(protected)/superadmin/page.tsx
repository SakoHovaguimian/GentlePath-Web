import type { Metadata } from 'next';
import { gentlePathPortalStrings as copy } from '@/strings';
import { AdminDashboardScreen } from '@/modules/portal/AdminDashboardScreen';

export const metadata: Metadata = { title: copy.admin.superTitle };
export default function GentlePathPage() {
  return <AdminDashboardScreen />;
}
