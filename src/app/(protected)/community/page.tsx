import type { Metadata } from 'next';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { CommunityScreen } from '@/modules/community/CommunityScreen';

export const metadata: Metadata = { title: copy.title };
export default function CommunityPage() {
  return <CommunityScreen />;
}
