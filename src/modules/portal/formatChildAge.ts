import { gentlePathPortalStrings as copy } from '@/strings';

export function formatChildAge(dateOfBirth: string, today = new Date()) {
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  let totalMonths =
    (today.getFullYear() - year) * 12 + today.getMonth() + 1 - month;
  const lastDay = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  if (today.getDate() < Math.min(day, lastDay)) totalMonths -= 1;
  totalMonths = Math.max(0, totalMonths);
  return copy.family.age(Math.floor(totalMonths / 12), totalMonths % 12);
}

export function formatChildBirthDate(dateOfBirth: string) {
  return new Date(`${dateOfBirth}T00:00:00`).toLocaleDateString('en-US', {
    dateStyle: 'long',
  });
}
