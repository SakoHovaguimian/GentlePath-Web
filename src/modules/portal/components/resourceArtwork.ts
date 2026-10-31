import { gentlePathIllustrations } from '@/models/gentlePathIllustrations';
import type { Resource } from '../models/resource';

const guideArtwork = {
  src: gentlePathIllustrations.readingGarden,
  landscape: true,
} as const;

export const resourceArtwork = {
  everyday: {
    src: gentlePathIllustrations.pathLandscape,
    landscape: true,
  },
  education: {
    src: gentlePathIllustrations.readingGarden,
    landscape: true,
  },
  communication: {
    src: gentlePathIllustrations.communityGarden,
    landscape: true,
  },
  wellbeing: {
    src: '/gentlepath/caregiver-community.png',
    landscape: false,
  },
} as const;

export function getResourceArtwork(resource: Resource) {
  return resource.format === 'guide'
    ? guideArtwork
    : resourceArtwork[resource.category];
}
