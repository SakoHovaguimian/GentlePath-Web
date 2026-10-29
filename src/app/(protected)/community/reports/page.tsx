import type { Metadata } from 'next';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { CommunityReportsScreen } from '@/modules/community/CommunityReportsScreen';

export const metadata: Metadata = { title: copy.myReports };
export default function CommunityReportsPage() {
  return <CommunityReportsScreen />;
}
