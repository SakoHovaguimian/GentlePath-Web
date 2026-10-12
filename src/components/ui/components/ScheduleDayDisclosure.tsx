'use client';

import { useId, type ReactNode } from 'react';
import { Button } from './Button';
import { UiIcon } from './UiIcon';
import { cn } from '../lib/cn';
import { strings } from '@/strings';

interface ScheduleDayDisclosureProps {
  day: string;
  wideTitle?: boolean;
  summary: ReactNode;
  expanded: boolean;
  disabled: boolean;
  invalid: boolean;
  onToggle: () => void;
  onEditFocus: () => void;
  children: ReactNode;
}

// Keep weekly days and dated exceptions scannable while revealing their controls.
export function ScheduleDayDisclosure({
  day,
  wideTitle = false,
  summary,
  expanded,
  disabled,
  invalid,
  onToggle,
  onEditFocus,
  children,
}: ScheduleDayDisclosureProps) {
  const id = useId();
  const copy = strings.schedule;
  return (
    <div
      className={cn(
        'min-w-0 first:[&>button]:rounded-t-xl last:[&>button]:rounded-b-xl',
        expanded && 'bg-secondary_subtle',
      )}
    >
      <Button
        id={`${id}-trigger`}
        variant="ghost"
        disabled={disabled}
        aria-expanded={expanded}
        aria-controls={`${id}-panel`}
        aria-label={copy.editDay(day)}
        aria-describedby={`${id}-summary`}
        onClick={onToggle}
        className={cn(
          'grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 rounded-none px-4 py-3 text-left font-normal focus-visible:-outline-offset-2 active:scale-[0.99]',
          wideTitle
            ? 'sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]'
            : 'sm:grid-cols-[8rem_minmax(0,1fr)_auto]',
        )}
      >
        <span
          title={wideTitle ? day : undefined}
          className={cn(
            'min-w-0 font-semibold text-primary',
            wideTitle ? 'truncate' : 'wrap-anywhere',
          )}
        >
          {day}
        </span>
        <span
          id={`${id}-summary`}
          className="col-start-1 row-start-2 min-w-0 text-sm text-secondary sm:col-start-2 sm:row-start-1"
        >
          {summary}
        </span>
        <span className="col-start-2 row-span-2 row-start-1 inline-flex items-center gap-2 self-center text-sm text-tertiary sm:col-start-3 sm:row-span-1">
          <span className={cn(invalid && 'text-error-primary')}>
            {invalid
              ? copy.reviewDay
              : expanded
                ? copy.doneEditing
                : copy.editHours}
          </span>
          <UiIcon
            name="chevronDown"
            className={cn(
              'size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none',
              expanded && 'rotate-180',
            )}
          />
        </span>
      </Button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!expanded}
        onFocusCapture={onEditFocus}
        className="px-4 pb-5 sm:pl-8"
      >
        {children}
      </div>
    </div>
  );
}
