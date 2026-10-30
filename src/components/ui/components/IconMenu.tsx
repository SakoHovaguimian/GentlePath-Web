'use client';

import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from 'react-aria-components';
import type { IconMenuItem } from '../models/iconMenuItem';
import type { IconName } from '../models/iconName';
import { buttonClassName } from '../lib/buttonStyles';
import { UiIcon } from './UiIcon';
import { cn } from '../lib/cn';

export function IconMenu<T extends string>({
  label,
  icon = 'moreVertical',
  items,
  disabled = false,
  className,
  onAction,
}: {
  label: string;
  icon?: IconName;
  items: IconMenuItem<T>[];
  disabled?: boolean;
  className?: string;
  onAction: (id: T) => void;
}) {
  return (
    <MenuTrigger>
      <span
        title={label}
        className={cn('relative z-20 inline-flex shrink-0', className)}
      >
        <Button
          aria-label={label}
          isDisabled={disabled}
          className={buttonClassName('ghost', 'min-h-11 min-w-11 gap-1 px-2')}
        >
          <UiIcon
            name={icon}
            strokeWidth={icon === 'moreVertical' ? 3.5 : undefined}
          />
          {icon !== 'moreVertical' && (
            <UiIcon name="chevronDown" className="size-3" />
          )}
        </Button>
      </span>
      <Popover
        placement={icon === 'moreVertical' ? 'bottom end' : 'bottom start'}
        offset={6}
        className="ui-popover z-100 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-secondary bg-primary p-1 shadow-(--dashboard-shell-shadow-lg)"
      >
        <Menu
          aria-label={label}
          items={items}
          className="max-h-[min(24rem,60dvh)] min-w-48 overflow-y-auto outline-none"
        >
          {(item) => (
            <MenuItem
              id={item.id}
              textValue={item.label}
              isDisabled={item.disabled}
              onAction={() => onAction(item.id)}
              className={cn(
                'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-primary outline-none hover:bg-secondary_subtle focus:bg-secondary_subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand pressed:bg-secondary disabled:cursor-not-allowed disabled:text-disabled',
                (item.variant === 'destructive' || item.intent === 'danger') &&
                  'text-error-primary hover:text-error-primary_hover focus:text-error-primary_hover',
              )}
            >
              <UiIcon
                name={item.icon}
                fill={item.selected ? 'currentColor' : 'none'}
              />
              <span>{item.label}</span>
            </MenuItem>
          )}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
