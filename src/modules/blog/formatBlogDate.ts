const numeric = 'numeric';

export function formatBlogDate(
  value: string,
  long = false,
  timeZone?: string,
): string {
  return new Intl.DateTimeFormat('en-US', {
    month: long ? 'long' : 'short',
    day: numeric,
    year: numeric,
    timeZone,
  }).format(new Date(value));
}
