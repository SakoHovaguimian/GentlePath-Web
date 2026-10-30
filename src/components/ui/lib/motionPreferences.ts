export function prefersReducedMotion() {
  return (
    typeof window === 'undefined' ||
    document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function motionDuration(
  token:
    | '--motion-duration-fast'
    | '--motion-duration-base'
    | '--motion-duration-celebration',
) {
  if (prefersReducedMotion()) return 0;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return Number.parseFloat(value) * (value.endsWith('ms') ? 1 : 1000) || 0;
}
