import type { Metadata } from 'next';
import { strings } from '@/strings';
export const metadata: Metadata = { title: strings.ui.appShell.users };
import { UsersScreen } from '@/modules/users/UsersScreen';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <UsersScreen query={typeof params.query === 'string' ? params.query : ''} />
  );
}
