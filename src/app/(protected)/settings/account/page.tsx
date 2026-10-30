import type { Metadata } from 'next';
import { ProfileScreen } from '@/modules/users/ProfileScreen';
import { strings } from '@/strings';

export const metadata: Metadata = {
  title: strings.ui.profileScreen.yourProfile,
};
export default function AccountPage() {
  return <ProfileScreen />;
}
