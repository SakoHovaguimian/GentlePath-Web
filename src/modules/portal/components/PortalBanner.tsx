import Image from 'next/image';
import type { ReactNode } from 'react';
import { gentlePathPortalStrings as copy } from '@/strings';

export function PortalBanner({
  title,
  description,
  image,
  imageAlt = copy.common.decorativeAlt,
  tone = 'sage',
  landscape = false,
  action,
  headingLevel = 'h2',
}: {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  tone?: 'sage' | 'lilac' | 'sunlight';
  landscape?: boolean;
  action?: ReactNode;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  return (
    <section
      className={`gp-portal-banner gp-portal-banner--${tone}${landscape ? ' gp-portal-banner--landscape' : ''}`}
    >
      <div className="gp-portal-banner__copy">
        <Heading>{title}</Heading>
        <p>{description}</p>
        {action}
      </div>
      <div className="gp-portal-banner__art">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
        />
      </div>
    </section>
  );
}
