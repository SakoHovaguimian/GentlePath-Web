export function milestoneListReturnPath(value: string | null) {
  if (!value) return '/milestones';
  try {
    const url = new URL(value, 'https://gentlepath.internal');
    return url.origin === 'https://gentlepath.internal' &&
      url.pathname === '/milestones'
      ? `${url.pathname}${url.search}`
      : '/milestones';
  } catch {
    return '/milestones';
  }
}

export function milestoneReaderPath(
  id: string,
  childId?: string,
  returnTo?: string,
  section?: string,
) {
  const params = new URLSearchParams();
  if (childId) params.set('child', childId);
  if (returnTo && returnTo !== '/milestones')
    params.set('returnTo', milestoneListReturnPath(returnTo));
  return `/milestones/${encodeURIComponent(id)}${params.size ? `?${params}` : ''}${section ? `#${section}` : ''}`;
}
