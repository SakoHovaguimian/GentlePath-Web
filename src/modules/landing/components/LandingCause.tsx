import Image from 'next/image';
import { gentlePathLandingStrings as copy } from '@/strings';

export function LandingCause() {
  return (
    <section
      id="our-purpose"
      className="gp-cause"
      aria-labelledby="gentlepath-cause-title"
    >
      <div className="gp-container gp-cause-layout">
        <div className="gp-section-heading">
          <p className="gp-eyebrow">{copy.cause.eyebrowLabel}</p>
          <h2 id="gentlepath-cause-title">{copy.cause.title}</h2>
          <p className="gp-section-description">{copy.cause.description}</p>
          <p className="gp-section-description">
            {copy.cause.supportDescription}
          </p>
          <p className="gp-cause-note">{copy.cause.noteDescription}</p>
        </div>
        <Image
          src="/gentlepath/parent-and-child.png"
          width={1280}
          height={1280}
          alt={copy.cause.artAlt}
          sizes="(max-width: 760px) 85vw, 35vw"
        />
      </div>
    </section>
  );
}
