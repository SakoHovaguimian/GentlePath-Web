'use client';

import { useEffect, useRef } from 'react';
import { strings } from '@/strings';
import type { ErrorStateProps } from '../models/errorStateProps';
import { Button } from './Button';
import { Card } from './Card';
import { IconTile } from './IconTile';
import { UiIcon } from './UiIcon';
import styles from './ErrorState.module.css';

export function ErrorState({
  title,
  description,
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  const retryButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (retrying || !restoreFocus.current) return;
    restoreFocus.current = false;
    if (
      document.activeElement === document.body ||
      document.activeElement === retryButton.current
    )
      retryButton.current?.focus();
  }, [retrying]);
  return (
    <Card
      role="alert"
      aria-busy={retrying || undefined}
      className={`ui-state ui-error-state ${styles.panel}`}
    >
      <IconTile intent="warning" className={styles.icon}>
        <UiIcon name="warning" className="size-5" />
      </IconTile>
      <div className={styles.content}>
        <div className={styles.copy}>
          <h3 className="m-0 font-display text-xl font-normal leading-snug text-primary sm:text-2xl">
            {title}
          </h3>
          <p className="m-0 text-sm leading-relaxed text-secondary">
            {description}
          </p>
        </div>
        {onRetry && (
          <div className={styles.actions}>
            <Button
              ref={retryButton}
              onClick={() => {
                restoreFocus.current =
                  document.activeElement === retryButton.current;
                onRetry();
              }}
              loading={retrying}
              className="w-fit gap-2"
            >
              <UiIcon name="refresh" className="size-4" />
              {strings.ui.states.retry}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
