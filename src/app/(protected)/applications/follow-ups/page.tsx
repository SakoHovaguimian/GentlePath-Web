import type { Metadata } from 'next';
import { ApplicationFollowUpsScreen } from '@/modules/applications/ApplicationFollowUpsScreen';
import { gentlePathApplicationStrings as copy } from '@/strings';
export const metadata: Metadata = { title: copy.priorityTitle };
export default function FollowUpsPage() {
  return <ApplicationFollowUpsScreen />;
}
