import type { Metadata } from 'next';
import { gentlePathPortalStrings as copy } from '@/strings';
import { PlatformSettingsScreen } from '@/modules/portal/PlatformSettingsScreen';

export const metadata: Metadata = { title: copy.system.title };
export default function GentlePathPage() {
  return <PlatformSettingsScreen />;
}
