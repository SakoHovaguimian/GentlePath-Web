import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Button, UiIcon } from '@/components/ui';
import { gentlePathOnboardingStrings as copy } from '@/strings';

export function OnboardingWelcome({ onContinue }: { onContinue: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <section
      className="gp-onboarding-welcome"
      aria-labelledby="onboarding-welcome-title"
      aria-describedby="onboarding-welcome-description"
    >
      <p className="gp-onboarding-eyebrow">{copy.welcome.eyebrow}</p>
      <h1 ref={heading} id="onboarding-welcome-title" tabIndex={-1}>
        {copy.welcome.title}
      </h1>
      <p
        id="onboarding-welcome-description"
        className="gp-onboarding-welcome-description"
      >
        {copy.welcome.description}
      </p>
      <div className="gp-onboarding-welcome-art">
        <Image
          src="/gentlepath/caregiver-community.png"
          alt={copy.welcome.artAlt}
          fill
          sizes="320px"
        />
      </div>
      <p className="gp-onboarding-welcome-saved">
        <UiIcon name="check" className="size-4" />
        {copy.welcome.saved}
      </p>
      <Button onClick={onContinue}>
        {copy.welcome.continue}
        <UiIcon name="arrowRight" className="size-4" />
      </Button>
    </section>
  );
}
