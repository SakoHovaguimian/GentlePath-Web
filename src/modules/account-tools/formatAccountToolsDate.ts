import { gentlePathAccountToolsStrings as copy } from '@/strings';

export function formatAccountToolsDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : copy.common.notRecorded;
}
export function formatTokenCount(value: number | null) {
  return value === null
    ? copy.common.notRecorded
    : new Intl.NumberFormat('en-US').format(value);
}
