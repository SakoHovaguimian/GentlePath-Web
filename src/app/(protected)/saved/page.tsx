import type { Metadata } from 'next';
import { gentlePathEngagementStrings as copy } from '@/strings';
import { SavedContentScreen } from '@/modules/engagement/SavedContentScreen';
export const metadata: Metadata = { title: copy.title };
export default function SavedPage() {
  return <SavedContentScreen />;
}
