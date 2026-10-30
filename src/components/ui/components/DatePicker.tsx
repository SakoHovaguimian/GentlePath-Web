'use client';

import { parseDate } from '@internationalized/date';
import { useEffect, useRef } from 'react';
import { I18nProvider } from 'react-aria/I18nProvider';
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateInput,
  DatePicker as AriaDatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover,
} from 'react-aria-components';
import { datePickerStrings as copy } from '@/strings';
import { cn } from '../lib/cn';
import { motionDuration } from '../lib/motionPreferences';
import type { DatePickerProps } from '../models/datePickerProps';
import { UiIcon } from './UiIcon';
import styles from './DatePicker.module.css';

function calendarDate(value?: string) {
  if (!value) return null;
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

/** A date-only field with an app-owned, accent-colored calendar. */
export function DatePicker({
  label,
  value,
  onValueChange,
  name,
  id,
  max,
  disabled,
  invalid,
  describedBy,
  className,
}: DatePickerProps) {
  const calendarTrigger = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (restoreFocus.current) clearTimeout(restoreFocus.current);
    },
    [],
  );
  return (
    <I18nProvider locale="en-US">
      <AriaDatePicker
        id={id}
        name={name}
        data-field-name={name}
        value={calendarDate(value)}
        maxValue={calendarDate(max) ?? undefined}
        onChange={(date) => onValueChange(date?.toString() ?? '')}
        onOpenChange={(open) => {
          if (restoreFocus.current) clearTimeout(restoreFocus.current);
          if (!open)
            restoreFocus.current = setTimeout(() => {
              requestAnimationFrame(() => calendarTrigger.current?.focus());
            }, motionDuration('--motion-duration-fast'));
        }}
        isDisabled={disabled}
        isInvalid={invalid}
        validationBehavior="aria"
        aria-describedby={describedBy}
        className={cn('grid min-w-0 gap-1.5', className)}
      >
        {({ state }) => (
          <>
            <Label className="text-sm font-medium text-secondary">
              {label}
            </Label>
            <Group
              className={cn(
                'ui-input flex min-h-12 min-w-0 items-center gap-2 rounded-lg border border-control-border bg-primary px-3 text-sm text-primary focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/12',
                styles.field,
              )}
            >
              <DateInput className="flex min-w-0 flex-1 items-center py-2.5">
                {(segment) => (
                  <DateSegment segment={segment} className={styles.segment} />
                )}
              </DateInput>
              <Button
                ref={calendarTrigger}
                aria-label={copy.openCalendar(label)}
                className={styles.trigger}
              >
                <UiIcon name="calendar" />
              </Button>
            </Group>
            <Popover
              offset={6}
              className={cn(
                'ui-popover z-100 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl border border-brand bg-primary p-3 shadow-(--dashboard-shell-shadow-lg)',
                styles.popover,
              )}
            >
              <Dialog className="outline-none">
                <Calendar aria-label={label} className={styles.calendar}>
                  <header className="mb-3 flex items-center justify-between gap-2">
                    <Button
                      slot="previous"
                      aria-label={copy.previousMonth}
                      className={styles.trigger}
                    >
                      <UiIcon name="chevronLeft" />
                    </Button>
                    <Heading className="m-0 text-sm font-semibold text-primary" />
                    <Button
                      slot="next"
                      aria-label={copy.nextMonth}
                      className={styles.trigger}
                    >
                      <UiIcon name="chevronRight" />
                    </Button>
                  </header>
                  <CalendarGrid className={styles.grid}>
                    <CalendarGridHeader>
                      {(day) => (
                        <CalendarHeaderCell className="pb-2 text-xs font-medium text-tertiary">
                          {day}
                        </CalendarHeaderCell>
                      )}
                    </CalendarGridHeader>
                    <CalendarGridBody>
                      {(date) => (
                        <CalendarCell date={date} className={styles.day} />
                      )}
                    </CalendarGridBody>
                  </CalendarGrid>
                </Calendar>
                <div className="mt-3 flex justify-end border-t border-secondary pt-2">
                  <Button
                    className={styles.clear}
                    onPress={() => {
                      onValueChange('');
                      state.setOpen(false);
                    }}
                  >
                    {copy.clearDate}
                  </Button>
                </div>
              </Dialog>
            </Popover>
          </>
        )}
      </AriaDatePicker>
    </I18nProvider>
  );
}
