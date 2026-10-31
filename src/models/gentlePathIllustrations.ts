import communityGarden from '../../public/gentlepath/community-garden-v2.png';
import pathLandscape from '../../public/gentlepath/path-landscape-v2.png';
import readingGarden from '../../public/gentlepath/reading-garden-v2.png';
import offThePath from '../../public/gentlepath/off-the-path.png';
import onboardingStateGarden from '../../public/gentlepath/onboarding-state-garden.png';
import guidedSteps from '../../public/gentlepath/guided-steps.png';
import milestoneGarden from '../../public/gentlepath/milestone-garden.png';

/** Static imports let Next.js refresh optimized URLs when the artwork changes. */
export const gentlePathIllustrations = {
  communityGarden: communityGarden.src,
  pathLandscape: pathLandscape.src,
  readingGarden: readingGarden.src,
  offThePath: offThePath.src,
  onboardingStateGarden: onboardingStateGarden.src,
  guidedSteps: guidedSteps.src,
  milestoneGarden: milestoneGarden.src,
} as const;
