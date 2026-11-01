import type { Metadata } from 'next';
import { gentlePathPortalStrings as copy } from '@/strings';
import { MilestoneDetailScreen } from '@/modules/portal/MilestoneDetailScreen';

export const metadata: Metadata = { title: copy.navigation.milestones };
export default async function MilestonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <MilestoneDetailScreen id={(await params).id} />;
}
