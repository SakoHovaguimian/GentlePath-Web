import { LandingFeatures } from './components/LandingFeatures';
import { LandingCause } from './components/LandingCause';
import { LandingContact } from './components/LandingContact';
import { gentlePathLandingStrings as copy } from '@/strings';
import { LandingFooter } from './components/LandingFooter';
import { LandingHeader } from './components/LandingHeader';
import { LandingHero } from './components/LandingHero';
import { LandingInvitation } from './components/LandingInvitation';
import { LandingQuestions } from './components/LandingQuestions';
import { LandingStories } from './components/LandingStories';
import { LandingSupport } from './components/LandingSupport';

export function LandingPage() {
  return (
    <div className="gp-public">
      <a href="#main-content" className="gp-skip-link">
        {copy.skipAction}
      </a>
      <LandingHeader />
      <main id="main-content">
        <LandingHero />
        <LandingSupport />
        <LandingFeatures />
        <LandingCause />
        <LandingStories />
        <LandingQuestions />
        <LandingContact />
        <LandingInvitation />
      </main>
      <LandingFooter />
    </div>
  );
}
