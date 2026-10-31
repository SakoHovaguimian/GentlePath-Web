import { gentlePathIllustrations } from '@/models/gentlePathIllustrations';

/** Public demo media identifiers resolve to bundled artwork, with no network dependency. */
export const demoMedia = {
  transition: 'https://demo-media.gentlepath.app/path-landscape-v2.png',
  reading: 'https://demo-media.gentlepath.app/reading-garden-v2.png',
  connection: 'https://demo-media.gentlepath.app/parent-and-child.png',
  community: 'https://demo-media.gentlepath.app/community-garden-v2.png',
} as const;

const bundledDemoMedia: Record<keyof typeof demoMedia, string> = {
  transition: gentlePathIllustrations.pathLandscape,
  reading: gentlePathIllustrations.readingGarden,
  connection: '/gentlepath/parent-and-child.png',
  community: gentlePathIllustrations.communityGarden,
};

export function resolveDemoMediaUrl(url: string, demoMode: boolean) {
  if (!demoMode) return url;
  const match = (Object.keys(demoMedia) as (keyof typeof demoMedia)[]).find(
    (key) => demoMedia[key] === url,
  );
  return match ? bundledDemoMedia[match] : url;
}
