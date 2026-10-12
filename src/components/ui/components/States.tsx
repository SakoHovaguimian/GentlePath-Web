import type { ReactNode } from 'react';
import { strings } from '@/strings';
import { Card } from './Card';
import { Button } from './Button';
import { IconTile } from './IconTile';
import { UiIcon } from './UiIcon';
import type { IconName } from '../models/iconName';

export function EmptyState({
  title,
  description,
  action,
  icon = 'box',
  variant = 'outlined',
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: IconName;
  // Plain sits inside an existing surface; card aliases the standalone outline.
  variant?: 'card' | 'plain' | 'outlined';
}) {
  const content = (
    <>
      <IconTile intent="neutral">
        <UiIcon name={icon} />
      </IconTile>
      <div className="grid max-w-md gap-1">
        <h3 className="m-0 text-base font-semibold text-primary">{title}</h3>
        <p className="m-0 text-sm text-secondary">{description}</p>
      </div>
      {action && (
        <div className="flex flex-wrap justify-center gap-2 pt-1">{action}</div>
      )}
    </>
  );
  return variant === 'plain' ? (
    <div className="ui-state grid justify-items-center gap-3 px-4 py-12 text-center">
      {content}
    </div>
  ) : (
    <Card className="ui-state grid justify-items-center gap-3 border-2 border-dotted py-10 text-center shadow-none">
      {content}
    </Card>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Card
      role="alert"
      className="ui-state grid justify-items-start gap-3 border-error_subtle bg-error-primary shadow-none"
    >
      <IconTile intent="danger">
        <UiIcon name="warning" />
      </IconTile>
      <div className="grid gap-1">
        <h3 className="m-0 text-base font-semibold text-primary">{title}</h3>
        <p className="m-0 max-w-prose text-sm text-secondary">{description}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {strings.ui.states.retry}
        </Button>
      )}
    </Card>
  );
}
