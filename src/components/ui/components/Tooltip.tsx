'use client';

import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  Tooltip as AriaTooltip,
  TooltipTrigger,
} from 'react-aria-components';
import { buttonClassName } from '../lib/buttonStyles';

export function Tooltip({
  label,
  content,
  children,
  className,
  triggerClassName,
}: {
  label: string;
  content: ReactNode;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
}) {
  return (
    <TooltipTrigger delay={200}>
      <AriaButton
        aria-label={label}
        className={triggerClassName ?? buttonClassName('secondary')}
      >
        {children}
      </AriaButton>
      <AriaTooltip
        offset={8}
        className={
          className ??
          'ui-tooltip z-[100] max-w-64 rounded-lg border border-secondary bg-primary px-4 py-3 text-xs text-secondary shadow-[var(--dashboard-shell-shadow-lg)]'
        }
      >
        {content}
      </AriaTooltip>
    </TooltipTrigger>
  );
}
