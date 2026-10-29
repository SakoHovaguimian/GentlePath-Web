'use client';

import { useCurrentTimezone } from '@/components/ui/lib/useCurrentTimezone';
import { formatBlogDate } from '../formatBlogDate';

export function BlogDate({
  value,
  long = false,
}: {
  value: string;
  long?: boolean;
}) {
  const timeZone = useCurrentTimezone();
  return (
    <time
      dateTime={value}
      style={{ minWidth: long ? '10rem' : '6rem', display: 'inline-block' }}
    >
      {timeZone ? formatBlogDate(value, long, timeZone) : value.slice(0, 10)}
    </time>
  );
}
