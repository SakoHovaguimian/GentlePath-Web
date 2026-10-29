import type { Metadata } from 'next';
import { HelpScreen } from '@/modules/account-tools/HelpScreen';
import { gentlePathAccountToolsStrings as copy } from '@/strings';

export const metadata: Metadata = { title: copy.help.title };
export default function HelpPage() {
  return <HelpScreen />;
}
