import type { Metadata } from 'next';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { GuideDetailScreen } from '@/modules/editorial/GuideDetailScreen';

export const metadata: Metadata = { title: copy.guidesTitle };
export default async function GuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <GuideDetailScreen id={(await params).id} />;
}
