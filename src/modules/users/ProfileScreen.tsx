'use client';

import {
  InitialsAvatar,
  Page,
  PageHeader,
  QueryBoundary,
  SectionStack,
  SplitSection,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { strings, gentlePathOnboardingStrings } from '@/strings';
import { AccountSettings } from '@/modules/account-tools/components/AccountSettings';
import { FamilyPreferencesBoundary } from '@/modules/onboarding/components/FamilyPreferencesBoundary';
import { FamilyPreferencesForm } from '@/modules/onboarding/components/FamilyPreferencesForm';
import { useFamilyPreferences } from '@/modules/onboarding/hooks';
import { ProfileForm } from './components/ProfileForm';
import { useUser } from './hooks';
import './styles/profile.css';

export function ProfileScreen() {
  const { session } = useSessionState();
  const query = useUser(session?.user.id || '');
  const preferences = useFamilyPreferences();
  const name = session
    ? `${session.user.firstName} ${session.user.lastName}`.trim()
    : '';
  return (
    <Page className="gp-profile">
      <PageHeader
        title={strings.ui.profileScreen.yourProfile}
        description={strings.ui.profileScreen.description}
        action={<InitialsAvatar name={name} />}
        meta={session && <span>{session.user.email}</span>}
      />
      <nav
        className="gp-profile-nav"
        aria-label={strings.ui.profileScreen.yourProfile}
      >
        <a href="#profile-details-title">
          {strings.ui.profileScreen.personalTitle}
        </a>
        <a href="#family-preferences-title">
          {gentlePathOnboardingStrings.preferencesTitle}
        </a>
      </nav>
      <SectionStack>
        <SplitSection
          id="profile-details"
          title={strings.ui.profileScreen.personalTitle}
          description={strings.ui.profileScreen.personalDescription}
        >
          <QueryBoundary query={query}>
            {(user) => <ProfileForm key={user.id} user={user} />}
          </QueryBoundary>
        </SplitSection>
        <SplitSection
          id="family-preferences"
          title={gentlePathOnboardingStrings.preferencesTitle}
          description={gentlePathOnboardingStrings.preferencesDescription}
        >
          <FamilyPreferencesBoundary query={preferences}>
            {(settings) => <FamilyPreferencesForm settings={settings} />}
          </FamilyPreferencesBoundary>
        </SplitSection>
      </SectionStack>
      <AccountSettings />
    </Page>
  );
}
