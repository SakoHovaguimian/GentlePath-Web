import type { Metadata } from 'next';
import { DevicesScreen } from '@/modules/account-tools/DevicesScreen';
import { gentlePathAccountToolsStrings as copy } from '@/strings';

export const metadata: Metadata = { title: copy.devices.title };
export default function DevicesPage() {
  return <DevicesScreen />;
}
