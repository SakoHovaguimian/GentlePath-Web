import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { Button, UiIcon } from '@/components/ui';
import { gentlePathOnboardingStrings as copy } from '@/strings';

export function OnboardingWelcome({
  celebrating,
  onReady,
  onCelebrationChange,
  onContinue,
}: {
  celebrating: boolean;
  onReady: () => void;
  onCelebrationChange: () => void;
  onContinue: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
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
          loading="eager"
          onLoad={onReady}
          onError={onReady}
        />
      </div>
      <p className="gp-onboarding-welcome-saved">
        <UiIcon name="check" className="size-4" />
        {copy.welcome.saved}
      </p>
      <div className="gp-onboarding-welcome-actions">
        <Button onClick={onContinue}>
          {copy.welcome.continue}
          <UiIcon name="arrowRight" className="size-4" />
        </Button>
        <Button variant="ghost" onClick={onCelebrationChange}>
          <UiIcon
            name={celebrating ? 'close' : 'sparkles'}
            className="size-4"
          />
          {celebrating ? copy.welcome.skipCelebration : copy.welcome.replay}
        </Button>
      </div>
    </section>
  );
}
