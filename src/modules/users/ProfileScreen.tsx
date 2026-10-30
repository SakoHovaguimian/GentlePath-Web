'use client';

import { Page, PageHeader, QueryBoundary } from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { strings } from '@/strings';
import { AccountSettings } from '@/modules/account-tools/components/AccountSettings';
import { ProfileForm } from './components/ProfileForm';
import { useUser } from './hooks';

export function ProfileScreen() {
  const { session } = useSessionState();
  const query = useUser(session?.user.id || '');
  return (
    <Page>
      <PageHeader title={strings.ui.profileScreen.yourProfile} />
      <QueryBoundary query={query}>
        {(user) => <ProfileForm key={user.id} user={user} />}
      </QueryBoundary>
      <AccountSettings />
    </Page>
  );
}
