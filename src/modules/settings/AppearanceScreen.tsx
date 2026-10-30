'use client';

import { Page, PageHeader, SplitSection } from '@/components/ui';
import { NotificationControls } from '@/services/notifications/components/NotificationControls';
import { strings } from '@/strings';
import { ThemeControls } from './components/ThemeControls';

export function AppearanceScreen() {
  return (
    <Page>
      <PageHeader
        title={strings.ui.appearanceScreen.appearance}
        description={strings.designSystem.themeHint}
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
    </Page>
  );
}
