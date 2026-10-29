import type { Metadata } from 'next';
import { AccountScreen } from '@/modules/account-tools/AccountScreen';
import { gentlePathAccountToolsStrings as copy } from '@/strings';

export const metadata: Metadata = { title: copy.account.title };
export default function AccountPage() {
  return <AccountScreen />;
}
