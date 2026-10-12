'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { Button } from './Button';
import { UiIcon } from './UiIcon';
import { cn } from '../lib/cn';

export function SidebarSwitcherDisclosure({
  title,
  subtitle,
  ariaLabel,
  leading,
  disabled,
  children,
}: {
  title: string;
  subtitle: string;
  ariaLabel: string;
  leading: ReactNode;
  disabled?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
  };
  return (
    <div
      className="rounded-xl border border-brand/20 bg-brand-primary p-1"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          close();
          trigger.current?.focus();
        }
      }}
    >
      <Button
        ref={trigger}
        variant="ghost"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open && !disabled}
        aria-controls={contentId}
        onClick={() => setOpen((value) => !value)}
        className="h-auto min-h-16 w-full min-w-0 justify-start gap-3 rounded-lg p-3 text-left whitespace-normal hover:bg-secondary_subtle focus-visible:-outline-offset-2"
      >
        {leading}
        <span className="grid min-w-0 flex-1 gap-1">
          <span className="text-sm font-semibold text-primary wrap-anywhere">
            {title}
          </span>
          <span className="text-xs font-normal text-secondary wrap-anywhere">
            {subtitle}
          </span>
        </span>
        <UiIcon
          name="chevronDown"
          className={cn(
            'size-4 text-secondary transition-transform motion-reduce:transition-none',
            open && !disabled && 'rotate-180',
          )}
        />
      </Button>
      <div id={contentId} hidden={!open || disabled}>
        {open && !disabled && children(close)}
      </div>
    </div>
  );
}
