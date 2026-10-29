import Link from 'next/link';
import { Button, UiIcon } from '@/components/ui';
import { gentlePathLandingStrings as copy } from '@/strings';

const familyIcons = ['user', 'quote', 'file'] as const;

export function LandingFamily() {
  return (
    <section
      id="your-family"
      className="gp-family-section"
      aria-labelledby="gentlepath-family-title"
    >
      <div className="gp-container gp-family-layout">
        <div className="gp-family-copy">
          <p className="gp-eyebrow">{copy.family.eyebrowLabel}</p>
          <h2 id="gentlepath-family-title">{copy.family.title}</h2>
          <p className="gp-section-description">{copy.family.description}</p>
          <Button
            asChild
            variant="secondary"
            className="gp-button gp-button-outline"
          >
            <Link href="/signup">
              {copy.family.primaryAction}
              <UiIcon name="arrowRight" />
            </Link>
          </Button>
          <p className="gp-family-note">{copy.family.noteDescription}</p>
        </div>
        <div className="gp-family-features">
          {copy.family.features.map((feature, index) => (
            <article className="gp-family-feature" key={feature.title}>
              <span className="gp-family-feature-icon">
                <UiIcon name={familyIcons[index]} />
              </span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
          <div className="gp-family-sentiment">
            <span className="gp-sentiment-flower" aria-hidden="true">
              <UiIcon name="sparkles" />
            </span>
            <p>{copy.family.sentimentDescription}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
