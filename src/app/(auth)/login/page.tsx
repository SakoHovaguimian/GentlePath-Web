import type { Metadata } from 'next';
import { strings } from '@/strings';
export const metadata: Metadata = { title: strings.ui.loginScreen.signIn };
import { LoginScreen } from '@/modules/auth/LoginScreen';
export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  return (
    <LoginScreen
      accountDeleted={query.accountDeleted === '1'}
      redirectTo={
        typeof query.redirectTo === 'string' ? query.redirectTo : undefined
      }
    />
  );
}
