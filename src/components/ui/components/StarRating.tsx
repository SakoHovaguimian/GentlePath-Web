'use client';

import { useId, useState } from 'react';
import type { StarRatingProps } from '../models/starRatingProps';
import { UiIcon } from './UiIcon';
import styles from './StarRating.module.css';

export function StarRating({
  value,
  onValueChange,
  onSelectedClick,
  label,
  valueLabel,
  getOptionLabel,
  describedBy,
  disabled = false,
  busy = false,
}: StarRatingProps) {
  const name = useId();
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const preview = disabled ? value : (hovered ?? focused ?? value);

  return (
    <fieldset
      disabled={disabled}
      aria-busy={busy}
      aria-describedby={describedBy}
      className={styles.rating}
    >
      <legend className="mb-2 text-sm font-semibold text-primary">
        {label}
      </legend>
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <div
          className={styles.choices}
          onPointerLeave={() => setHovered(null)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setFocused(null);
          }}
        >
          {[1, 2, 3, 4, 5].map((option) => (
            <label
              key={option}
              className={styles.choice}
              data-filled={option <= (preview ?? 0) || undefined}
              data-selected={value === option || undefined}
              onPointerEnter={(event) => {
                if (!disabled && event.pointerType !== 'touch')
                  setHovered(option);
              }}
            >
              <input
                type="radio"
                className={styles.input}
                name={name}
                value={option}
                checked={value === option}
                aria-label={getOptionLabel(option)}
                aria-describedby={describedBy}
                aria-disabled={busy || undefined}
                onClick={(event) => {
                  if (busy) event.preventDefault();
                  else if (!disabled && value === option) onSelectedClick?.();
                }}
                onKeyDown={(event) => {
                  if (
                    busy &&
                    [
                      'ArrowUp',
                      'ArrowDown',
                      'ArrowLeft',
                      'ArrowRight',
                      ' ',
                    ].includes(event.key)
                  )
                    event.preventDefault();
                }}
                onFocus={() => setFocused(option)}
                onChange={() => {
                  if (!disabled && !busy) onValueChange(option);
                }}
              />
              <span className={styles.surface} aria-hidden="true">
                <UiIcon name="star" className={styles.star} />
              </span>
            </label>
          ))}
        </div>
        <span
          className="min-w-24 text-sm font-semibold text-(--color-rating-active)"
          aria-hidden="true"
        >
          {valueLabel}
        </span>
      </div>
    </fieldset>
  );
}
