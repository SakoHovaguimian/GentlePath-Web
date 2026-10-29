import Image from 'next/image';
import Link from 'next/link';
import { Button, UiIcon } from '@/components/ui';
import { gentlePathLandingStrings as copy } from '@/strings';

export function LandingHero() {
  return (
    <section
      className="gp-hero gp-container"
      aria-labelledby="gentlepath-hero-title"
    >
      <div className="gp-hero-copy">
        <p className="gp-eyebrow">
          <UiIcon name="leaf" />
          {copy.hero.eyebrowLabel}
        </p>
        <h1 id="gentlepath-hero-title">
          {copy.hero.firstHeading}
          <em>{copy.hero.secondHeading}</em>
        </h1>
        <p className="gp-hero-description">{copy.hero.description}</p>
        <div className="gp-hero-actions">
          <Button asChild className="gp-button gp-button-large">
            <Link href="/signup">
              {copy.hero.primaryAction}
              <UiIcon name="arrowRight" />
            </Link>
          </Button>
          <a href="#support" className="gp-text-link">
            {copy.hero.secondaryAction}
            <UiIcon name="chevronDown" />
          </a>
        </div>
        <div className="gp-hero-reassurance">
          <span className="gp-reassurance-icon" aria-hidden="true">
            <UiIcon name="leaf" />
          </span>
          <p>{copy.hero.reassuranceDescription}</p>
        </div>
      </div>
      <figure className="gp-hero-art">
        <Image
          src="/gentlepath/path-landscape-v2.png"
          width={1536}
          height={1024}
          alt={copy.hero.artAlt}
          sizes="(max-width: 760px) 94vw, 49vw"
          preload
        />
        <figcaption>
          <UiIcon name="sparkles" />
          {copy.hero.artCaption}
        </figcaption>
      </figure>
      <div className="gp-hero-bottom">
        <div>
          <UiIcon name="leaf" />
          <p>{copy.hero.bottomLabel}</p>
        </div>
        <span>{copy.hero.bottomDescription}</span>
      </div>
    </section>
  );
}
