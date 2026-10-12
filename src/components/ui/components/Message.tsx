import type { ComponentPropsWithRef, ReactNode } from 'react';
import { strings } from '@/strings';
import type { UiIntent } from '../models/uiIntent';
import type { IconName } from '../models/iconName';
import { IconButton } from './IconButton';
import { UiIcon } from './UiIcon';
import { cn } from '../lib/cn';

const tones: Record<UiIntent, string> = {
  neutral: 'border-secondary bg-secondary_subtle text-secondary',
  info: 'border-utility-blue-200 bg-utility-blue-50 text-utility-blue-700',
  success:
    'border-utility-success-200 bg-utility-success-50 text-utility-success-700',
  warning:
    'border-utility-warning-200 bg-utility-warning-50 text-utility-warning-700',
  danger: 'border-utility-error-200 bg-utility-error-50 text-utility-error-700',
};
const icons: Record<UiIntent, IconName> = {
  neutral: 'info',
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'close',
};

export function Message({
  title,
  description,
  intent = 'info',
  onDismiss,
  action,
  className,
  role,
  ...props
}: Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  title: string;
  description?: ReactNode;
  intent?: UiIntent;
  onDismiss?: () => void;
  action?: ReactNode;
}) {
  return (
    <div
      role={role ?? (intent === 'danger' ? 'alert' : 'status')}
      className={cn(
        'ui-message flex min-w-0 items-start gap-3 rounded-lg border p-3',
        tones[intent],
        className,
      )}
      {...props}
    >
      <UiIcon name={icons[intent]} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-semibold wrap-anywhere">{title}</p>
        {description && (
          <div className="m-0 mt-1 text-xs wrap-anywhere">{description}</div>
        )}
        {action && <div className="mt-3 flex flex-wrap gap-3">{action}</div>}
      </div>
      {onDismiss && (
        <IconButton
          variant="ghost"
          label={strings.componentLibrary.dismissMessage(title)}
          onClick={onDismiss}
        >
          <UiIcon name="close" className="size-4" />
        </IconButton>
      )}
    </div>
  );
}
