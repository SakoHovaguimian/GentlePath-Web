import { useEffect } from 'react';
import { Button, Card, UiIcon } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { ChildProfile } from '../models/childProfile';
import type { JournalEntry } from '../models/journalEntry';
import { journalEntryCardId } from '../journalEntryLocation';

const numericYear = 'numeric';

export function JournalEntryCard({
  entry,
  childrenProfiles,
  focused,
  removing,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry;
  childrenProfiles: ChildProfile[];
  focused: boolean;
  removing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const id = journalEntryCardId(entry.id);
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
      className="gp-journal-card"
      data-emotion={entry.emotion}
      data-linked={focused || undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-tertiary">
          {new Date(entry.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: numericYear,
          })}
        </span>
      </div>
      <div className="gp-journal-card__tags">
        {entry.childId && (
          <span className="gp-child-tag">
            <UiIcon name="user" className="size-3.5" />
            {childrenProfiles.find((child) => child.id === entry.childId)?.name}
          </span>
        )}
        <span className="gp-emotion" data-emotion={entry.emotion}>
          {copy.journal.emotions[entry.emotion]}
        </span>
      </div>
      <h2 id={`${id}-title`}>{entry.title}</h2>
      <p className="m-0 line-clamp-4 flex-1 text-sm leading-7 whitespace-pre-line text-secondary">
        {entry.body}
      </p>
      <div className="mt-2 flex justify-between gap-2 border-t border-secondary pt-3">
        <Button variant="ghost" onClick={onEdit}>
          {copy.common.edit}
          <UiIcon name="arrowRight" className="size-4" />
        </Button>
        <Button
          variant="destructive"
          disabled={removing}
          onClick={onDelete}
          aria-label={copy.journal.deleteAction}
        >
          <UiIcon name="trash" className="size-4" />
        </Button>
      </div>
    </Card>
  );
}
