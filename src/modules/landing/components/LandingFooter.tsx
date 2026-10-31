import Link from 'next/link';
import { GentlePathBrand } from '@/components/GentlePathBrand';
import { gentlePathLandingStrings as copy } from '@/strings';

export function LandingFooter() {
  return (
    <footer className="gp-public-footer">
      <div className="gp-container">
        <div className="gp-footer-top">
          <div>
            <Link
              href="/"
              className="gp-brand-link"
              aria-label={copy.homeLabel}
            >
              <GentlePathBrand />
            </Link>
            <p className="gp-footer-description">{copy.footer.description}</p>
          </div>
          <nav aria-label={copy.footer.navigationLabel}>
            <Link href="/#support">{copy.navigation.supportLabel}</Link>
            <Link href="/blog">{copy.navigation.blogLabel}</Link>
            <Link href="/#our-purpose">{copy.navigation.purposeLabel}</Link>
            <Link href="/#contact">{copy.navigation.contactLabel}</Link>
            <Link href="/signup" prefetch={false}>
              {copy.navigation.signupAction}
            </Link>
          </nav>
        </div>
        <div className="gp-footer-bottom">
          <p>{copy.footer.copyrightDescription}</p>
          <p>{copy.footer.careDescription}</p>
        </div>
      </div>
    </footer>
  );
}
