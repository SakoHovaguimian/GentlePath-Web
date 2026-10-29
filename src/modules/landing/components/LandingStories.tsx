import Image from 'next/image';
import Link from 'next/link';
import { UiIcon, buttonClassName } from '@/components/ui';
import { gentlePathLandingStrings as copy } from '@/strings';

export function LandingStories() {
  return (
    <section
      className="gp-stories gp-container"
      aria-labelledby="gentlepath-stories-title"
    >
      <div className="gp-stories-art">
        <Image
          src="/gentlepath/care-notes.png"
          width={1280}
          height={1280}
          alt={copy.stories.artAlt}
          sizes="(max-width: 760px) 78vw, 38vw"
        />
      </div>
      <div className="gp-stories-copy">
        <p className="gp-eyebrow">{copy.stories.eyebrowLabel}</p>
        <h2 id="gentlepath-stories-title">{copy.stories.title}</h2>
        <p className="gp-section-description">{copy.stories.description}</p>
        <div className="gp-story-topics" aria-label={copy.stories.topicsLabel}>
          {copy.stories.topics.map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
        </div>
        <Link
          href="/blog"
          className={buttonClassName(
            'primary',
            'gp-button gp-button-large gp-stories-action',
          )}
        >
          {copy.stories.primaryAction}
          <UiIcon name="arrowRight" />
        </Link>
      </div>
    </section>
  );
}
