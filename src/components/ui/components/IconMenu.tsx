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

export function IconMenu<T extends string>({
  label,
  icon,
  items,
  disabled = false,
  onAction,
}: {
  label: string;
  icon: IconName;
  items: IconMenuItem<T>[];
  disabled?: boolean;
  onAction: (id: T) => void;
}) {
  return (
    <MenuTrigger>
      <span title={label} className="inline-flex">
        <Button
          aria-label={label}
          isDisabled={disabled}
          className={buttonClassName('ghost', 'min-h-11 gap-1 px-2')}
        >
          <UiIcon name={icon} />
          <UiIcon name="chevronDown" className="size-3" />
        </Button>
      </span>
      <Popover
        placement="bottom start"
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
              onAction={() => onAction(item.id)}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-primary outline-none hover:bg-secondary_subtle focus:bg-secondary_subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand pressed:bg-secondary"
            >
              <UiIcon name={item.icon} />
              <span>{item.label}</span>
            </MenuItem>
          )}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
