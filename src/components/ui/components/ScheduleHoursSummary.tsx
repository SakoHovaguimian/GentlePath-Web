import { strings } from '@/strings';

const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
});

export function ScheduleHoursSummary({
  windows,
}: {
  windows: {
    sequence: number;
    closed: boolean;
    opens_at: string | null;
    closes_at: string | null;
  }[];
}) {
  const copy = strings.schedule;
  if (windows.length === 1 && windows[0].closed) return copy.closed;
  return (
    <span className="grid gap-1 tabular-nums">
      {windows.map((window) => (
        <span key={window.sequence}>
          {window.opens_at && window.closes_at
            ? copy.hoursRange(
                timeFormat.format(
                  new Date(`2000-01-01T${window.opens_at}:00Z`),
                ),
                timeFormat.format(
                  new Date(`2000-01-01T${window.closes_at}:00Z`),
                ),
                window.closes_at < window.opens_at,
              )
            : copy.incompleteHours}
        </span>
      ))}
    </span>
  );
}
