import type { Metadata } from 'next';
import { gentlePathPortalStrings as copy } from '@/strings';
import { ModerationScreen } from '@/modules/portal/ModerationScreen';

export const metadata: Metadata = { title: copy.navigation.moderation };
export default function GentlePathPage() {
  return <ModerationScreen />;
}
