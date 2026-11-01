import { z } from 'zod';

export const AgeBandSchema = z.enum([
  'AGE_0_2',
  'AGE_3_5',
  'AGE_6_8',
  'AGE_9_12',
  'AGE_13_17',
  'AGE_18_24',
  'AGE_25_PLUS',
]);
export type AgeBand = z.infer<typeof AgeBandSchema>;

const numericYear = 'numeric';

export function completedYears(
  dateOfBirth: string,
  timezone = 'UTC',
  now = new Date(),
): number {
  const birthYear = Number(dateOfBirth.slice(0, 4));
  const birthMonth = Number(dateOfBirth.slice(5, 7));
  const birthDay = Number(dateOfBirth.slice(8, 10));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: numericYear,
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === 'year')!.value);
  const month = Number(parts.find((part) => part.type === 'month')!.value);
  const day = Number(parts.find((part) => part.type === 'day')!.value);
  const birthdayPending =
    month < birthMonth || (month === birthMonth && day < birthDay);
  return Math.max(0, year - birthYear - (birthdayPending ? 1 : 0));
}
export function childAgeBand(
  dateOfBirth: string,
  timezone = 'UTC',
  now = new Date(),
): AgeBand {
  const years = completedYears(dateOfBirth, timezone, now);
  return years <= 2
    ? 'AGE_0_2'
    : years <= 5
      ? 'AGE_3_5'
      : years <= 8
        ? 'AGE_6_8'
        : years <= 12
          ? 'AGE_9_12'
          : years <= 17
            ? 'AGE_13_17'
            : years <= 24
              ? 'AGE_18_24'
              : 'AGE_25_PLUS';
}
