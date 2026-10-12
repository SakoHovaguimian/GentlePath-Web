export function locationScheduleFormat(recordedTimezone: string) {
  let timezone = recordedTimezone;
  let format: Intl.DateTimeFormat;
  try {
    format = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
    });
  } catch {
    timezone = 'UTC';
    format = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
    });
  }
  return { timezone, format };
}
