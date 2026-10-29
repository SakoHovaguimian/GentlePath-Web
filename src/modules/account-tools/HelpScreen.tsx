'use client';

import { useSearchParams } from 'next/navigation';
import { Page, PageHeader, SegmentedPanels } from '@/components/ui';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import { FrequentlyAskedQuestionsPanel } from './components/FrequentlyAskedQuestionsPanel';
import { LegalInformationPanel } from './components/LegalInformationPanel';

type HelpSection = 'faq' | 'terms' | 'privacy';
const helpSections = {
  faq: 'faq',
  terms: 'terms',
  privacy: 'privacy',
} as const;
export function HelpScreen() {
  const params = useSearchParams();
  const directory = usePortalDirectory();
  const section = params.get('section');
  const value: HelpSection =
    section === 'terms' || section === 'privacy' ? section : 'faq';
  return (
    <Page>
      <PageHeader title={copy.help.title} description={copy.help.description} />
      <SegmentedPanels<HelpSection>
        label={copy.help.sectionLabel}
        value={value}
        onValueChange={(next) =>
          directory.update({ section: next === 'faq' ? undefined : next })
        }
        panels={[
          {
            value: helpSections.faq,
            label: copy.help.faqTab,
            content: <FrequentlyAskedQuestionsPanel />,
          },
          {
            value: helpSections.terms,
            label: copy.help.termsTab,
            content: <LegalInformationPanel context="terms_of_service" />,
          },
          {
            value: helpSections.privacy,
            label: copy.help.privacyTab,
            content: <LegalInformationPanel context="privacy_policy" />,
          },
        ]}
      />
    </Page>
  );
}
