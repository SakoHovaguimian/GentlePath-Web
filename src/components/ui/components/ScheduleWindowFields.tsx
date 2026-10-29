import type { RefObject } from 'react';
import { Button } from './Button';
import { Field } from './Field';
import { Input } from './Input';
import { strings } from '@/strings';
import { cn } from '../lib/cn';

type Window = { opens_at: string | null; closes_at: string | null };

// Shared weekly/dated schedule controls; draft ownership stays with the caller.
export function ScheduleWindowFields({
  window,
  label,
  prefix,
  invalid,
  fields,
  onChange,
  onRemove,
  removeLabel,
  compact = false,
}: {
  window: Window;
  label: string;
  prefix: string;
  invalid: Record<string, string>;
  fields: RefObject<Map<string, HTMLElement>>;
  onChange: (key: keyof Window, value: string | null) => void;
  onRemove?: () => void;
  removeLabel: string;
  compact?: boolean;
}) {
  const copy = strings.schedule;
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'grid min-w-0 gap-3',
        !compact && 'border-t border-secondary pt-3',
      )}
    >
      {!compact && (
        <p className="m-0 text-xs font-medium text-secondary">{label}</p>
      )}
      <div className="grid min-w-0 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        {(['opens_at', 'closes_at'] as const).map((key) => {
          const field = `${prefix}.${key}`;
          const id = field.replaceAll('.', '-');
          const error = invalid[field] || invalid[`${prefix}.closed`];
          return (
            <div key={key} className="grid min-w-0 gap-1.5">
              <Field labelText={key === 'opens_at' ? copy.opens : copy.closes}>
                <Input
                  id={id}
                  type="time"
                  value={window[key] ?? ''}
                  ref={(element) => {
                    if (element) fields.current.set(field, element);
                    else fields.current.delete(field);
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-error` : undefined}
                  onChange={(event) =>
                    onChange(key, event.target.value || null)
                  }
                  onInput={(event) =>
                    onChange(key, event.currentTarget.value || null)
                  }
                />
              </Field>
              {error && (
                <p
                  id={`${id}-error`}
                  className="m-0 text-sm text-error-primary"
                >
                  {error}
                </p>
              )}
            </div>
          );
        })}
        {onRemove && (
          <Button
            variant="destructive"
            className="sm:mt-7"
            aria-label={removeLabel}
            onClick={onRemove}
          >
            {copy.removeWindow}
          </Button>
        )}
      </div>
      {window.opens_at &&
        window.closes_at &&
        window.closes_at < window.opens_at && (
          <p className="m-0 text-xs text-secondary">
            {copy.overnightHoursHint}
          </p>
        )}
    </div>
  );
}
