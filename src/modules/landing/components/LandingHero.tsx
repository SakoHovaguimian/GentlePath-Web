import Image from 'next/image';
import Link from 'next/link';
import { Button, UiIcon } from '@/components/ui';
import { gentlePathIllustrations } from '@/models/gentlePathIllustrations';
import { gentlePathLandingStrings as copy } from '@/strings';

export function LandingHero() {
  return (
    <section className="gp-hero" aria-labelledby="gentlepath-hero-title">
      <div className="gp-hero-art">
        <Image
          src={gentlePathIllustrations.sharedMomentsHero}
          alt={copy.hero.artAlt}
          fill
          sizes="(max-width: 760px) 155vw, 100vw"
          quality={100}
          preload
        />
      </div>
      <div className="gp-hero-content">
        <div className="gp-hero-copy">
          <p className="gp-eyebrow">
            <UiIcon name="heart" />
            {copy.hero.eyebrowLabel}
          </p>
          <h1 id="gentlepath-hero-title">
            {copy.hero.firstHeading}
            <em>{copy.hero.secondHeading}</em>
          </h1>
          <p className="gp-hero-description">{copy.hero.description}</p>
          <div className="gp-hero-actions">
            <Button
              asChild
              className="gp-button gp-button-large gp-hero-primary"
            >
              <Link href="/signup" prefetch={false}>
                {copy.hero.primaryAction}
                <UiIcon name="arrowRight" />
              </Link>
            </Button>
            <a href="#support" className="gp-text-link">
              {copy.hero.secondaryAction}
              <UiIcon name="chevronDown" />
            </a>
          </div>
        </div>
      </div>
      <div className="gp-hero-bottom">
        <svg
          className="gp-hero-wave"
          viewBox="0 0 1586 64"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M0 30C190-6 318 8 463 32S651 67 827 35 1092-3 1282 8s232 26 304 6"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div>
          <UiIcon name="heart" />
          <p>{copy.hero.bottomLabel}</p>
        </div>
        <span>{copy.hero.bottomDescription}</span>
      </div>
    </section>
  );
}
