import type { Metadata } from 'next';
import { ApplicationsScreen } from '@/modules/applications/ApplicationsScreen';
import { gentlePathApplicationStrings as copy } from '@/strings';
export const metadata: Metadata = { title: copy.title };
export default function ApplicationsPage() {
  return <ApplicationsScreen />;
}
