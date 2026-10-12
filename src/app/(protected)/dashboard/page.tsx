import type { Metadata } from 'next';
import { strings } from '@/strings';
export const metadata: Metadata = { title: strings.ui.dashboardScreen.dashboard };
import { DashboardScreen } from '@/modules/dashboard/DashboardScreen';

export default async function DashboardPage() {
  return <DashboardScreen />;
}
