'use client';

import { useId, type Ref } from 'react';
import { strings } from '@/strings';
import { localDateTimeInstants } from '@/utils/locationDateTime';
import { Field } from './Field';
import { Input } from './Input';
import { Select } from './Select';

export function LocationDateTimeField({
  label,
  value,
  timezone,
  preferredInstant,
  disabled,
  error,
  describedBy,
  inputRef,
  onChange,
}: {
  label: string;
  value: string;
  timezone: string;
  preferredInstant?: string;
  disabled: boolean;
  error?: string;
  describedBy?: string;
  inputRef: Ref<HTMLInputElement>;
  onChange: (value: string, instant?: string) => void;
}) {
  const id = useId();
  const copy = strings.scheduleEditor;
  const instants = localDateTimeInstants(value, timezone);
  const invalidTime = Boolean(value && !instants.length);
  const message = invalidTime ? copy.invalidTime : error;
  const repeated = instants.length > 1;
  const selected =
    preferredInstant && instants.includes(preferredInstant)
      ? preferredInstant
      : instants[0];
  return (
    <div className="grid min-w-0 content-start gap-2">
      <Field labelText={label}>
        <Input
          id={id}
          type="datetime-local"
          step="any"
          value={value}
          disabled={disabled}
          ref={inputRef}
          aria-invalid={Boolean(message)}
          aria-describedby={
            [describedBy, message ? `${id}-error` : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
          onChange={(event) => onChange(event.target.value)}
          onInput={(event) => onChange(event.currentTarget.value)}
        />
      </Field>
      {message && (
        <p id={`${id}-error`} className="m-0 text-sm text-error-primary">
          {message}
        </p>
      )}
      {repeated && (
        <Field labelText={copy.repeatedTime}>
          <Select
            value={selected}
            disabled={disabled}
            onValueChange={(instant) => onChange(value, instant)}
          >
            {instants.map((instant, index) => (
              <option key={instant} value={instant}>
                {copy.occurrence(
                  index === 0,
                  new Intl.DateTimeFormat('en-US', {
                    timeZone: timezone,
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'longOffset',
                  }).format(new Date(instant)),
                )}
              </option>
            ))}
          </Select>
        </Field>
      )}
    </div>
  );
}
