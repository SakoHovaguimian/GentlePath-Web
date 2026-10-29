import { gentlePathLandingStrings as copy } from '@/strings';
import { LandingFamily } from './components/LandingFamily';
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
        <LandingFamily />
        <LandingStories />
        <LandingQuestions />
        <LandingInvitation />
      </main>
      <LandingFooter />
    </div>
  );
}
