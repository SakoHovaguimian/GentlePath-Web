import type { Metadata } from 'next';
import { gentlePathPortalStrings as copy } from '@/strings';
import { ManagedUsersScreen } from '@/modules/portal/ManagedUsersScreen';

export const metadata: Metadata = { title: copy.people.title };
export default function GentlePathPage() {
  return <ManagedUsersScreen />;
}
