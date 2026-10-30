'use client';

import { useRef } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Badge, BookmarkButton, Card, IconMenu, UiIcon } from '@/components/ui';
import { gentlePathEngagementStrings as copy } from '@/strings';
import { MutationError } from '@/modules/portal/components/MutationError';
import type { SavedContent } from '../models/savedContent';
import { useSetSavedContent } from '../hooks';
import styles from '../SavedContent.module.css';

export function SavedContentCard({ item }: { item: SavedContent }) {
  const mutation = useSetSavedContent();
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
      await mutation.mutateAsync({
        contentType: item.contentType,
        contentId: item.contentId,
        saved: false,
      });
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
        <div className="flex items-center gap-1">
          <BookmarkButton
            saved
            variant="ghost"
            className={styles.bookmark}
            aria-label={copy.removeSavedLabel(title)}
            loading={mutation.isPending}
            onClick={() => void remove()}
          />
          <IconMenu
            label={copy.actionsLabel(title)}
            disabled={mutation.isPending}
            items={[
              {
                id: 'unsave',
                label: copy.unsave,
                icon: 'bookmark',
                selected: true,
              },
            ]}
            onAction={() => void remove()}
          />
        </div>
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
