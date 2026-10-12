import type { Metadata } from 'next';
import { strings } from '@/strings';
export const metadata: Metadata = { title: strings.ui.userDetailScreen.userDetail };
import { UserDetailScreen } from '@/modules/users/UserDetailScreen';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <UserDetailScreen userId={id} />;
}
