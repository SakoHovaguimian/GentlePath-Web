'use client';

import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Popover,
} from 'react-aria-components';
import { buttonClassName } from '../lib/buttonStyles';

export function InfoPopover({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <DialogTrigger>
      <AriaButton className={buttonClassName('secondary')}>{label}</AriaButton>
      <Popover
        offset={8}
        className="ui-popover z-100 max-w-[min(90vw,22rem)] rounded-xl border border-secondary bg-primary p-4 shadow-(--dashboard-shell-shadow-lg)"
      >
        <Dialog
          aria-label={label}
          className="text-sm text-secondary outline-none"
        >
          {children}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
