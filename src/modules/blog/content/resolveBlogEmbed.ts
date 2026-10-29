import type { BlogEmbedPlayer } from '../models/blogEmbedPlayer';

/** Build player URLs ourselves; authored URLs never become arbitrary iframes. */
export function resolveBlogEmbed(value: string): BlogEmbedPlayer | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port)
    return null;
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean);
  if (
    [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtube-nocookie.com',
      'www.youtube-nocookie.com',
      'youtu.be',
    ].includes(host)
  ) {
    const id =
      host === 'youtu.be'
        ? parts.length === 1 && parts[0]
        : url.pathname === '/watch'
          ? url.searchParams.get('v')
          : ['embed', 'shorts', 'live'].includes(parts[0]) &&
            parts.length === 2 &&
            parts[1];
    if (id && /^[\w-]{11}$/.test(id))
      return {
        provider: 'youtube',
        src: `https://www.youtube-nocookie.com/embed/${id}?playsinline=1`,
      };
  }
  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
    const playerPath = host === 'player.vimeo.com';
    const id = playerPath
      ? parts[0] === 'video' && parts.length === 2 && parts[1]
      : parts.length <= 2 && parts[0];
    const hash = url.searchParams.get('h') ?? (!playerPath && parts[1]);
    if (id && /^\d{1,16}$/.test(id)) {
      if (hash && !/^[a-zA-Z0-9]{5,32}$/.test(hash)) return null;
      const parameters = new URLSearchParams({ dnt: '1' });
      if (hash) parameters.set('h', hash);
      return {
        provider: 'vimeo',
        src: `https://player.vimeo.com/video/${id}?${parameters}`,
      };
    }
  }
  if (host === 'open.spotify.com') {
    if (/^intl-[a-z]{2}$/.test(parts[0] ?? '')) parts.shift();
    if (parts[0] === 'embed') parts.shift();
    const [kind, id] = parts;
    if (
      parts.length === 2 &&
      ['track', 'album', 'artist', 'playlist', 'show', 'episode'].includes(kind) &&
      /^[a-zA-Z0-9]{22}$/.test(id)
    )
      return {
        provider: 'spotify',
        src: `https://open.spotify.com/embed/${kind}/${id}`,
      };
  }
  return null;
}
