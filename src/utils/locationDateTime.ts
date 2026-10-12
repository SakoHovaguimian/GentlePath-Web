import { z } from 'zod';

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timezone: string) {
  const cached = formatters.get(timezone);
  if (cached) return cached;
  const yearFormat = 'numeric';
  const result = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: yearFormat,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  formatters.set(timezone, result);
  return result;
}

export function localDateTime(instant: string, timezone: string) {
  const date = new Date(instant);
  const parts = formatter(timezone).formatToParts(date);
  const part = (name: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === name)!.value;
  return `${part('year').padStart(4, '0')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}.${String(date.getUTCMilliseconds()).padStart(3, '0')}`;
}

// A wall-clock value has no offset. Validate its calendar before Date can
// normalize impossible dates, then find the offsets on both sides of a change.
export function localDateTimeInstants(
  value: string,
  timezone: string,
): string[] {
  const withSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
    ? `${value}:00`
    : value;
  if (!z.string().datetime().safeParse(`${withSeconds}Z`).success) return [];
  const wall = new Date(`${withSeconds}Z`);
  const canonical = wall.toISOString().slice(0, -1);
  try {
    const offsets = new Set<number>();
    for (const hours of [-36, -24, -12, 0, 12, 24, 36]) {
      const probe = new Date(wall.getTime() + hours * 3_600_000);
      offsets.add(
        Date.parse(`${localDateTime(probe.toISOString(), timezone)}Z`) -
          probe.getTime(),
      );
    }
    return [...offsets]
      .map((offset) => new Date(wall.getTime() - offset).toISOString())
      .filter((instant) => localDateTime(instant, timezone) === canonical)
      .sort();
  } catch {
    return [];
  }
}

export function localDateTimeToUtc(
  value: string,
  timezone: string,
  preferredInstant?: string,
) {
  const instants = localDateTimeInstants(value, timezone);
  return preferredInstant && instants.includes(preferredInstant)
    ? preferredInstant
    : (instants[0] ?? null);
}

export function newLocalSchedule(locationId: string, timezone: string) {
  // Minute precision keeps the initial native controls easy to edit.
  const instant = new Date(
    Math.floor(Date.now() / 60_000) * 60_000,
  ).toISOString();
  const local = localDateTime(instant, timezone).slice(0, 16);
  return {
    locationId,
    timezone,
    starts: local,
    ends: '',
    startsInstant: instant,
    endsInstant: undefined,
  };
}

export function savedLocalSchedule(schedule: {
  locationId: string;
  timezone: string;
  startsAt: string;
  endsAt: string | null;
}) {
  let timezone = schedule.timezone;
  try {
    formatter(timezone);
  } catch {
    timezone = 'UTC';
  }
  return {
    locationId: schedule.locationId,
    timezone,
    starts: localDateTime(schedule.startsAt, timezone),
    ends: schedule.endsAt ? localDateTime(schedule.endsAt, timezone) : '',
    startsInstant: new Date(schedule.startsAt).toISOString(),
    endsInstant: schedule.endsAt
      ? new Date(schedule.endsAt).toISOString()
      : undefined,
  };
}
