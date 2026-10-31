/** Public demo media identifiers resolve to bundled artwork, with no network dependency. */
export const demoMedia = {
  transition: 'https://demo-media.gentlepath.app/path-landscape-v2.png',
  reading: 'https://demo-media.gentlepath.app/reading-garden-v2.png',
  connection: 'https://demo-media.gentlepath.app/parent-and-child.png',
  community: 'https://demo-media.gentlepath.app/community-garden-v2.png',
} as const;

export function resolveDemoMediaUrl(url: string, demoMode: boolean) {
  if (!demoMode) return url;
  const match = Object.values(demoMedia).find((item) => item === url);
  return match
    ? `/gentlepath/${new URL(match).pathname.split('/').pop()}`
    : url;
}
