import type { ReactNode } from 'react';
import { Card } from './Card';
import { IconTile } from './IconTile';
import { UiIcon } from './UiIcon';
import { Badge } from './Badge';

export function MetricCard({
  eyebrow,
  value,
  caption,
  icon,
  change,
}: {
  eyebrow: string;
  value: string;
  caption: string;
  icon?: ReactNode;
  change?: string;
}) {
  return (
    <Card className="grid gap-3 p-4 sm:p-4">
      <p className="m-0 text-xs font-medium text-tertiary">{eyebrow}</p>
      <div className="flex flex-wrap items-center gap-3">
        <IconTile>{icon ?? <UiIcon name="chart" />}</IconTile>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-xl font-semibold text-primary tabular-nums">
            {value}
          </p>
          <p className="m-0 mt-1 text-xs text-tertiary">{caption}</p>
        </div>
        {change && (
          <Badge intent="success">
            <UiIcon name="arrowUp" className="size-3.5" />
            {change}
          </Badge>
        )}
      </div>
    </Card>
  );
}
