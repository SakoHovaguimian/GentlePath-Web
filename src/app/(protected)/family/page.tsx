import type { Metadata } from 'next';
import { gentlePathPortalStrings as copy } from '@/strings';
import { FamilyScreen } from '@/modules/portal/FamilyScreen';

export const metadata: Metadata = { title: copy.family.title };
export default function GentlePathPage() {
  return <FamilyScreen />;
}
