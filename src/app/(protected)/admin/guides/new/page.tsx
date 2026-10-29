import type { Metadata } from 'next';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { GuideEditorScreen } from '@/modules/editorial/GuideEditorScreen';

export const metadata: Metadata = { title: copy.newGuide };
export default function NewGuidePage() {
  return <GuideEditorScreen />;
}
