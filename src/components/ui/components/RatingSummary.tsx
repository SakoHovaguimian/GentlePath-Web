'use client';

import type { RatingSummaryProps } from '../models/ratingSummaryProps';
import { cn } from '../lib/cn';
import { UiIcon } from './UiIcon';
import styles from './RatingSummary.module.css';

export function RatingSummary({
  average,
  count,
  label,
  averageLabel,
  countLabel,
  emptyLabel,
  compact = false,
  className,
}: RatingSummaryProps) {
  const score = average ?? 0;
  const hasRatings = score > 0 && count > 0;
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(styles.summary, className)}
    >
      <span
        aria-hidden="true"
        className="inline-flex flex-wrap items-center gap-x-2 gap-y-1"
      >
        <span className="inline-flex items-center gap-0.5">
          {(compact ? [1] : [1, 2, 3, 4, 5]).map((value) => (
            <span key={value} className={styles.star}>
              <UiIcon name="star" className={styles.outline} />
              <span
                className={styles.fill}
                style={{
                  width: `${hasRatings ? (compact ? 100 : Math.max(0, Math.min(1, score - value + 1)) * 100) : 0}%`,
                }}
              >
                <UiIcon name="star" className={styles.filled} />
              </span>
            </span>
          ))}
        </span>
        {hasRatings ? (
          <>
            <span className="font-semibold tabular-nums">{averageLabel}</span>
            <span className="text-xs text-tertiary">{countLabel}</span>
          </>
        ) : (
          <span className="text-xs text-tertiary">{emptyLabel}</span>
        )}
      </span>
    </span>
  );
}
