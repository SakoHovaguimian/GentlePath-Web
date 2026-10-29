export function InitialsAvatar({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/u).filter(Boolean);
  const initials = [parts[0], ...(parts.length > 1 ? [parts.at(-1)] : [])]
    .map((part) => Array.from(part ?? '')[0] ?? '')
    .join('')
    .toLocaleUpperCase('en-US');
  return (
    <span
      aria-hidden="true"
      className="ui-avatar inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-sm font-semibold text-brand-secondary"
    >
      {initials}
    </span>
  );
}
