'use client';

import Link from 'next/link';
import {
  Button,
  Page,
  PageHeader,
  SplitSection,
  UiIcon,
} from '@/components/ui';
import { NotificationControls } from '@/services/notifications/components/NotificationControls';
import { CookieConsentControls } from '@/services/privacy/components/CookieConsentControls';
import { strings } from '@/strings';
import { ThemeControls } from './components/ThemeControls';

export function AppearanceScreen() {
  return (
    <Page>
      <PageHeader
        title={strings.ui.appearanceScreen.appearance}
        description={strings.designSystem.themeHint}
        action={
          <Button asChild variant="secondary">
            <Link href="/dev-settings/components">
              <UiIcon name="code" />
              {strings.designSystem.openLibrary}
            </Link>
          </Button>
        }
      />
      <SplitSection
        id="theme"
        title={strings.designSystem.theme}
        description={strings.designSystem.themeHint}
      >
        <ThemeControls />
      </SplitSection>
      <SplitSection
        id="notifications"
        title={strings.notifications.title}
        description={strings.notifications.available}
      >
        <NotificationControls />
      </SplitSection>
      <SplitSection
        id="privacy"
        title={strings.privacy.title}
        description={strings.privacy.description}
      >
        <CookieConsentControls settings />
      </SplitSection>
    </Page>
  );
}
