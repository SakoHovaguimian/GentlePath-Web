import type { Metadata } from 'next';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { GuideEditorScreen } from '@/modules/editorial/GuideEditorScreen';

export const metadata: Metadata = { title: copy.editGuide };
export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <GuideEditorScreen id={(await params).id} />;
}
