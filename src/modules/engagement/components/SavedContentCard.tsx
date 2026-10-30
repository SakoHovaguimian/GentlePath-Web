'use client';

import { useRef } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Badge, Card, IconButton, UiIcon } from '@/components/ui';
import { gentlePathEngagementStrings as copy } from '@/strings';
import { MutationError } from '@/modules/portal/components/MutationError';
import { usePresentationService } from '@/presentation/PresentationProvider';
import type { SavedContent } from '../models/savedContent';
import { useSetSavedContent } from '../hooks';
import styles from '../SavedContent.module.css';

export function SavedContentCard({ item }: { item: SavedContent }) {
  const mutation = useSetSavedContent();
  const { showAlert, showToast } = usePresentationService();
  const busy = useRef(false);
  const title = item.target?.title || copy.untitled;
  const href = item.target
    ? ((item.target.readerPath ??
        `/saved/${encodeURIComponent(item.id)}`) as Route)
    : null;

  async function remove() {
    if (busy.current) return;
    busy.current = true;
    try {
      if (
        !(await showAlert({
          title: copy.removeSavedTitle,
          description: copy.removeSavedDescription(title),
          confirmLabel: copy.removeSavedAction,
          cancelLabel: copy.keepSavedAction,
          tone: 'danger',
        }))
      )
        return;
      await mutation.mutateAsync({
        contentType: item.contentType,
        contentId: item.contentId,
        saved: false,
      });
      void showToast({ title: copy.removedTitle, intent: 'success' });
    } catch {
      /* Keep the card and show inline recovery. */
    } finally {
      busy.current = false;
    }
  }

  return (
    <Card className={styles.card}>
      <div className={styles.top}>
        <span className={styles.type}>{copy.types[item.contentType]}</span>
        <IconButton
          variant="destructive"
          className={styles.bookmark}
          label={copy.removeSavedLabel(title)}
          loading={mutation.isPending}
          onClick={() => void remove()}
        >
          <UiIcon name="bookmark" fill="currentColor" className="size-5" />
        </IconButton>
      </div>
      <div className={styles.content}>
        <h2>
          {href ? (
            <Link href={href} className={styles.open}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p>{item.target?.preview || copy.unavailableDescription}</p>
        {!item.target && (
          <Badge intent="warning" className="justify-self-start">
            {copy.unavailableTitle}
          </Badge>
        )}
      </div>
      {href && (
        <span className={styles.footer} aria-hidden="true">
          {item.target?.readerPath ? copy.read : copy.readPreview}
          <UiIcon name="arrowRight" className="size-4" />
        </span>
      )}
      <MutationError error={mutation.error} />
    </Card>
  );
}
