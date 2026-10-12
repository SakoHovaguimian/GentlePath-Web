'use client';

import { useId, useRef, useState } from 'react';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { strings } from '@/strings';

export function ScheduleCopyDays({
  source,
  days,
  disabled,
  canApply,
  onApply,
}: {
  source: number;
  days: readonly string[];
  disabled: boolean;
  canApply: (targets: number[]) => boolean;
  onApply: (targets: number[]) => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [targets, setTargets] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const copy = strings.schedule;
  const allowed = canApply(targets);
  return (
    <div className="grid min-w-0 gap-3">
      <div>
        <Button
          ref={trigger}
          variant="ghost"
          disabled={disabled}
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
          className="px-0 hover:bg-transparent"
        >
          {copy.copyHours}
        </Button>
      </div>
      {expanded && (
        <fieldset
          id={id}
          disabled={disabled}
          className="grid min-w-0 gap-3 border-t border-secondary pt-3"
        >
          <legend className="text-sm font-semibold text-primary">
            {copy.copyFromDay(days[source])}
          </legend>
          <p className="m-0 text-xs text-secondary">{copy.copyHoursHint}</p>
          <div className="grid gap-x-6 sm:grid-cols-2">
            {days.map((day, weekday) =>
              weekday === source ? null : (
                <Checkbox
                  key={weekday}
                  label={day}
                  checked={targets.includes(weekday)}
                  onChange={(event) =>
                    setTargets(
                      event.target.checked
                        ? [...targets, weekday].sort((a, b) => a - b)
                        : targets.filter((value) => value !== weekday),
                    )
                  }
                />
              ),
            )}
          </div>
          {!allowed && (
            <p className="m-0 text-sm text-error-primary">{copy.hoursLimit}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={!targets.length || !allowed}
              onClick={() => {
                onApply(targets);
                setAnnouncement(
                  copy.hoursCopied(
                    days[source],
                    targets.map((day) => days[day]),
                  ),
                );
                setTargets([]);
                setExpanded(false);
                trigger.current?.focus();
              }}
            >
              {copy.applyHours(targets.length)}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setExpanded(false);
                trigger.current?.focus();
              }}
            >
              {strings.ui.alertModal.cancel}
            </Button>
          </div>
        </fieldset>
      )}
      <p role="status" className="m-0 text-xs text-secondary">
        {announcement}
      </p>
    </div>
  );
}
