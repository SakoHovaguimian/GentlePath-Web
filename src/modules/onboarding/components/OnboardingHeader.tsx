import { GentlePathBrand } from '@/components/GentlePathBrand';
import { NavigationLink, UiIcon } from '@/components/ui';
import { ThemeToggle } from '@/modules/settings/components/ThemeToggle';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import {
  gentlePathOnboardingStrings as copy,
  gentlePathLandingStrings,
} from '@/strings';

export function OnboardingHeader() {
  const { confirmNavigation } = useNavigationGuard();
  return (
    <header className="gp-onboarding-header">
      <NavigationLink
        href="/"
        beforeNavigate={() => confirmNavigation()}
        aria-label={gentlePathLandingStrings.homeLabel}
        className="gp-brand-link"
      >
        <GentlePathBrand />
      </NavigationLink>
      <div className="gp-onboarding-header-actions">
        <span className="gp-onboarding-private">
          <UiIcon name="leaf" className="size-4" />
          {copy.privateLabel}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
