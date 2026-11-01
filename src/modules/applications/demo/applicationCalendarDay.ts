import 'server-only';
import { getDemoNotificationInboxState } from '@/modules/notification-inbox/demo/notificationInboxState';

const numericYear = 'numeric';

export function demoApplicationCalendarDay(userId: string) {
  const timezone =
    getDemoNotificationInboxState().settings.get(userId)?.effectiveTimezone ??
    'UTC';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: numericYear,
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: string) =>
    parts.find((part) => part.type === type)!.value;
  return Date.UTC(
    Number(value('year')),
    Number(value('month')) - 1,
    Number(value('day')),
  );
}

export function demoApplicationDate(userId: string, days: number) {
  return new Date(demoApplicationCalendarDay(userId) + days * 86400000)
    .toISOString()
    .slice(0, 10);
}
