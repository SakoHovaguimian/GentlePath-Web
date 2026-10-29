import type { Metadata } from 'next';
import { strings } from '@/strings';
export const metadata: Metadata = {
  title: strings.ui.signupScreen.createAccount,
};
import { SignupScreen } from '@/modules/auth/SignupScreen';
export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  return (
    <SignupScreen
      redirectTo={
        typeof query.redirectTo === 'string' ? query.redirectTo : undefined
      }
    />
  );
}
