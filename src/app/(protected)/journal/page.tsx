import type { Metadata } from 'next';
import { gentlePathPortalStrings as copy } from '@/strings';
import { JournalScreen } from '@/modules/portal/JournalScreen';

export const metadata: Metadata = { title: copy.journal.title };
export default function GentlePathPage() {
  return <JournalScreen />;
}
