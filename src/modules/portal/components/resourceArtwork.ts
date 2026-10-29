import type { Resource } from '../models/resource';

const guideArtwork = {
  src: '/gentlepath/reading-garden-v2.png',
  landscape: true,
} as const;

export const resourceArtwork = {
  everyday: {
    src: '/gentlepath/path-landscape-v2.png',
    landscape: true,
  },
  education: {
    src: '/gentlepath/reading-garden-v2.png',
    landscape: true,
  },
  communication: {
    src: '/gentlepath/community-garden-v2.png',
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
