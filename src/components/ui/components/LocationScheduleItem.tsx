import { DescriptionList } from './DescriptionList';
import { IconTile } from './IconTile';
import { UiIcon } from './UiIcon';
import { LocationScheduleTime } from './LocationScheduleCells';
import { locationScheduleFormat } from '../lib/locationScheduleFormat';
import type { LocationScheduleValue } from '../models/locationSchedule';

export function LocationScheduleItem({
  name,
  schedule,
  copy,
}: {
  name: string;
  schedule: LocationScheduleValue;
  copy: {
    starts: string;
    ends: string;
    timezone: string;
    noEnd: string;
  };
}) {
  const { timezone } = locationScheduleFormat(schedule.timezone);
  return (
    <li className="grid min-w-0 gap-5 p-4 sm:p-6">
      <div className="flex min-w-0 items-center gap-3">
        <IconTile intent="neutral" size="sm">
          <UiIcon name="store" />
        </IconTile>
        <h4 className="m-0 min-w-0 text-base font-semibold text-primary wrap-anywhere">
          {name}
        </h4>
      </div>
      <DescriptionList
        items={[
          {
            label: copy.starts,
            value: (
              <LocationScheduleTime
                schedule={schedule}
                endpoint="startsAt"
                noEnd={copy.noEnd}
              />
            ),
          },
          {
            label: copy.ends,
            value: (
              <LocationScheduleTime
                schedule={schedule}
                endpoint="endsAt"
                noEnd={copy.noEnd}
              />
            ),
          },
        ]}
      />
      <dl className="m-0 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-secondary pt-4 text-xs text-secondary">
        <dt>{copy.timezone}</dt>
        <dd className="m-0 min-w-0 wrap-anywhere">{timezone}</dd>
      </dl>
    </li>
  );
}
