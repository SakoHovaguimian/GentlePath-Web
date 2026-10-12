import type { Metadata } from 'next';
import { strings } from '@/strings';
export const metadata: Metadata = { title: strings.ui.profileScreen.yourProfile };
import { ProfileScreen } from '@/modules/users/ProfileScreen';

export default async function ProfilePage() {
  return <ProfileScreen />;
}
