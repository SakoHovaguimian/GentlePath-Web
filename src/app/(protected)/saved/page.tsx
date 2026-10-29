import type { Metadata } from 'next';
import { gentlePathPortalStrings as copy } from '@/strings';
import { ResourcesScreen } from '@/modules/portal/ResourcesScreen';
export const metadata: Metadata = { title: copy.resources.savedTitle };
export default function SavedPage() {
  return <ResourcesScreen savedOnly />;
}
