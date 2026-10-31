import Image from 'next/image';
import { gentlePathLandingStrings as copy } from '@/strings';

const supportIllustrations = [
  '/gentlepath/family-connection.png',
  '/gentlepath/guided-steps.png',
  '/gentlepath/community-messages.png',
] as const;

export function LandingSupport() {
  return (
    <section
      id="support"
      className="gp-support gp-container"
      aria-labelledby="gentlepath-support-title"
    >
      <div className="gp-section-heading gp-section-heading-centered">
        <p className="gp-eyebrow">{copy.support.eyebrowLabel}</p>
        <h2 id="gentlepath-support-title">{copy.support.title}</h2>
        <p className="gp-section-description">{copy.support.description}</p>
      </div>
      <div className="gp-pillars">
        {copy.support.pillars.map((pillar, index) => (
          <article className="gp-pillar" key={pillar.title}>
            <div className="gp-pillar-art">
              <Image
                src={supportIllustrations[index]}
                width={1280}
                height={1280}
                alt={pillar.artAlt}
                sizes="(max-width: 760px) 70vw, 26vw"
              />
            </div>
            <div className="gp-pillar-copy">
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
              <div className="gp-pillar-topics">
                {pillar.topics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
