import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardOpenButton, IconMenu, UiIcon } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { JournalEntryCardProps } from '../models/journalEntryCardProps';
import { journalEntryCardId } from '../journalEntryLocation';
import { journalEmotionGradient } from '../journalEmotionGradient';
import { JournalEmotions } from './JournalEmotions';

const numericYear = 'numeric';

export function JournalEntryCard({
  entry,
  childrenProfiles,
  focused = false,
  removing,
  onEdit,
  onDelete,
  href,
  compact = false,
  headingLevel: Heading = 'h2',
}: JournalEntryCardProps) {
  const id = journalEntryCardId(entry.id);
  const child = childrenProfiles.find((child) => child.id === entry.childId);
  useEffect(() => {
    if (!focused) return;
    const frame = requestAnimationFrame(() => {
      const card = document.getElementById(id);
      card?.focus({ preventScroll: true });
      card?.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [focused, id]);
  return (
    <Card
      id={id}
      role="article"
      aria-labelledby={`${id}-title`}
      tabIndex={-1}
      className={`gp-journal-card${compact ? ' gp-journal-card--compact' : ''}`}
      data-linked={focused || undefined}
    >
      <div
        className="gp-journal-card__header"
        style={{ backgroundImage: journalEmotionGradient(entry.emotions) }}
      >
        <Heading id={`${id}-title`}>
          {href && !removing ? (
            <Link
              href={href}
              className="ui-card-open gp-journal-card__open"
              aria-label={copy.journal.openEntry(entry.title)}
            >
              {entry.title}
            </Link>
          ) : (
            <CardOpenButton
              className="gp-journal-card__open"
              disabled={removing}
              aria-label={copy.journal.openEntry(entry.title)}
              onClick={onEdit}
            >
              {entry.title}
            </CardOpenButton>
          )}
        </Heading>
        <div className="gp-journal-card__menu">
          <IconMenu
            label={copy.journal.entryActions(entry.title)}
            disabled={removing}
            items={[
              { id: 'edit', icon: 'file', label: copy.common.edit },
              {
                id: 'delete',
                icon: 'trash',
                label: copy.journal.deleteAction,
                variant: 'destructive',
              },
            ]}
            onAction={(action) => {
              if (action === 'edit') onEdit();
              else onDelete();
            }}
          />
        </div>
      </div>
      <p className="gp-journal-card__body">{entry.body}</p>
      <div className="gp-journal-card__footer">
        <div className="gp-journal-card__metadata">
          <span className="gp-child-tag">
            <UiIcon name="user" className="size-3.5" />
            {entry.childId
              ? (child?.name ?? copy.journal.relatedChildUnavailable)
              : copy.journal.personal}
          </span>
          <span className="gp-journal-card__date">
            <UiIcon name="calendar" className="size-3.5" />
            {entry.createdAt ? (
              <time dateTime={entry.createdAt}>
                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: numericYear,
                })}
              </time>
            ) : (
              copy.journal.dateUnavailable
            )}
          </span>
        </div>
        {entry.emotions.length > 0 && (
          <div className="gp-journal-card__tags">
            <JournalEmotions emotions={entry.emotions} />
          </div>
        )}
      </div>
    </Card>
  );
}
