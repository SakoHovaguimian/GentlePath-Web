const supportedRoutes = new Set([
  'dashboard',
  'family',
  'journal',
  'milestones',
  'resources',
  'guides',
  'tips',
  'community',
  'polls',
  'discounts',
  'notifications',
  'saved',
  'help',
  'blog',
]);

/** Notification payloads cannot navigate to external origins, auth, or executable URLs. */
export function notificationDestination(destination: string | null) {
  if (
    !destination ||
    !destination.startsWith('/') ||
    destination.startsWith('//') ||
    /[\\\u0000-\u001f]/.test(destination)
  )
    return null;
  try {
    const url = new URL(destination, 'https://gentlepath.internal');
    if (
      url.origin !== 'https://gentlepath.internal' ||
      !supportedRoutes.has(url.pathname.split('/')[1])
    )
      return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
