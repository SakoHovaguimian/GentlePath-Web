import { UiIcon } from '@/components/ui';
import { gentlePathLandingStrings as copy } from '@/strings';

const icons = [
  'user',
  'quote',
  'leaf',
  'folder',
  'chat',
  'checklist',
  'layers',
  'sun',
  'gift',
  'bookmark',
] as const;

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="gp-features gp-container"
      aria-labelledby="gentlepath-features-title"
    >
      <span id="your-family" className="gp-anchor-alias" aria-hidden="true" />
      <div className="gp-section-heading">
        <p className="gp-eyebrow">{copy.features.eyebrowLabel}</p>
        <h2 id="gentlepath-features-title">{copy.features.title}</h2>
        <p className="gp-section-description">{copy.features.description}</p>
      </div>
      <div className="gp-feature-directory">
        {copy.features.items.map((item, index) => (
          <article key={item.title}>
            <span className="gp-feature-directory-icon">
              <UiIcon name={icons[index]} />
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="gp-features-privacy">{copy.features.privacyDescription}</p>
      <p className="gp-features-note">
        <UiIcon name="bell" />
        {copy.features.noteDescription}
      </p>
    </section>
  );
}
