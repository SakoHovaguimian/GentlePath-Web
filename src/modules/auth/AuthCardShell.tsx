import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GentlePathBrand } from '@/components/GentlePathBrand';
import { UiIcon } from '@/components/ui';
import {
  gentlePathAuthStrings,
  gentlePathLandingStrings,
  gentlePathPortalStrings,
} from '@/strings';

type AuthCardShellProps = {
  badge: string;
  title: string;
  description: string;
  footerPrompt: string;
  footerHref: string;
  footerAction: string;
  children: ReactNode;
  mockHint?: string;
  variant?: 'login' | 'signup';
};

export function AuthCardShell({
  badge,
  title,
  description,
  footerPrompt,
  footerHref,
  footerAction,
  children,
  mockHint,
  variant = 'login',
}: AuthCardShellProps) {
  return (
    <main className="gp-auth">
      <aside className="gp-auth-story">
        <Link
          href="/"
          className="gp-brand-link"
          aria-label={gentlePathLandingStrings.homeLabel}
        >
          <GentlePathBrand />
        </Link>
        <div className="gp-auth-story-content">
          <p className="gp-eyebrow">{gentlePathPortalStrings.auth.eyebrow}</p>
          <h2>
            {variant === 'signup'
              ? gentlePathAuthStrings.signupStoryTitle
              : gentlePathAuthStrings.loginStoryTitle}
          </h2>
          <p className="gp-auth-story-description">
            {variant === 'signup'
              ? gentlePathAuthStrings.signupStoryDescription
              : gentlePathAuthStrings.loginStoryDescription}
          </p>
          <Image
            src="/gentlepath/parent-and-child.png"
            width={1280}
            height={1280}
            alt={gentlePathAuthStrings.storyArtAlt}
            sizes="(max-width: 900px) 1px, 42vw"
            priority
          />
        </div>
        <p className="gp-auth-story-trust">
          {gentlePathPortalStrings.auth.trust}
        </p>
      </aside>
      <section
        className="gp-auth-form-area"
        aria-labelledby="gentlepath-auth-title"
      >
        <Link href="/" className="gp-auth-back">
          <UiIcon name="chevronLeft" />
          {gentlePathPortalStrings.auth.home}
        </Link>
        <Link
          href="/"
          className="gp-auth-mobile-brand"
          aria-label={gentlePathLandingStrings.homeLabel}
        >
          <GentlePathBrand />
        </Link>
        <div className="gp-auth-card">
          <div className="gp-auth-heading">
            <p className="gp-eyebrow">{badge}</p>
            <h1 id="gentlepath-auth-title">{title}</h1>
            <p>{description}</p>
          </div>
          {mockHint ? (
            <p id="gentlepath-auth-demo-hint" className="gp-auth-demo-hint">
              {mockHint}
            </p>
          ) : null}
          {children}
          <div className="gp-auth-footer">
            <span>{footerPrompt}</span>
            <Link href={footerHref as never}>{footerAction}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
