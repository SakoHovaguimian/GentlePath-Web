import Image from 'next/image';
import { gentlePathIllustrations } from '@/models/gentlePathIllustrations';
import { gentlePathOnboardingStrings as copy } from '@/strings';
import type { OnboardingStep } from '../models/onboardingStep';

const artwork = {
  STATE: gentlePathIllustrations.onboardingStateGarden,
  CHILDREN: '/gentlepath/family-connection.png',
  DISCOVERY: gentlePathIllustrations.guidedSteps,
  FINISH: '/gentlepath/growing-together-v2.png',
  COMPLETE: '/gentlepath/growing-together-v2.png',
} as const;

export function OnboardingStory({ step }: { step: OnboardingStep }) {
  return (
    <aside className="gp-onboarding-story" aria-labelledby="onboarding-title">
      <div className="gp-onboarding-story-copy">
        <p className="gp-onboarding-eyebrow">{copy.eyebrow}</p>
        <h1 id="onboarding-title">{copy.storyTitles[step]}</h1>
        <p className="gp-onboarding-story-description">
          {copy.storyDescriptions[step]}
        </p>
      </div>
      <div className="gp-onboarding-art">
        <Image
          key={artwork[step]}
          src={artwork[step]}
          alt={copy.artworkAlt[step]}
          fill
          sizes="(max-width: 599px) 112px, (max-width: 899px) 250px, 480px"
          className="object-contain"
          preload={step === 'STATE'}
        />
      </div>
    </aside>
  );
}
