import type { Metadata } from 'next';
import { gentlePathEngagementStrings as copy } from '@/strings';
import { SavedContentDetailScreen } from '@/modules/engagement/SavedContentDetailScreen';
export const metadata: Metadata = { title: copy.previewTitle };
export default async function SavedItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <SavedContentDetailScreen id={(await params).id} />;
}
