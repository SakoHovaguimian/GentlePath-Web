'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button, IconButton, UiIcon } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';

export function DashboardWelcome({ name }: { name: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <section className="gp-home-hero" aria-labelledby="dashboard-welcome-title">
      <IconButton
        className="gp-home-hero__dismiss"
        variant="secondary"
        label={copy.home.dismissWelcome}
        onClick={() => setDismissed(true)}
      >
        <UiIcon name="close" />
      </IconButton>
      <div className="gp-home-hero__copy">
        <span className="gp-home-hero__eyebrow">
          <UiIcon name="leaf" className="size-4" />
          {copy.home.welcomeEyebrow}
        </span>
        <h2 id="dashboard-welcome-title">{copy.home.welcomeTitle(name)}</h2>
        <p>{copy.home.welcomeDescription}</p>
        <Button asChild>
          <Link href="/family">
            {copy.home.welcomeAction}
            <UiIcon name="arrowRight" />
          </Link>
        </Button>
      </div>
      <div className="gp-home-hero__art">
        <Image
          src="/gentlepath/path-landscape-v2.png"
          alt={copy.home.heroAlt}
          fill
          sizes="(max-width: 767px) 100vw, 55vw"
          priority
        />
      </div>
    </section>
  );
}
