import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { gentlePathDemoStrings } from '@/strings';
import { isDevSettingsAvailable } from '@/services/demo/demoRuntime';
import { DevSettingsScreen } from '@/modules/dev-settings/DevSettingsScreen';

export const metadata: Metadata = { title: gentlePathDemoStrings.title };

export default function DevSettingsPage() {
  if (!isDevSettingsAvailable()) notFound();
  return <DevSettingsScreen />;
}
