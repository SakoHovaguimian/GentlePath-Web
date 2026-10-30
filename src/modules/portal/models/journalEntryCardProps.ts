import type { Route } from 'next';
import type { ChildProfile } from './childProfile';
import type { JournalEntry } from './journalEntry';

export interface JournalEntryCardProps {
  entry: JournalEntry;
  childrenProfiles: ChildProfile[];
  focused?: boolean;
  removing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  href?: Route;
  compact?: boolean;
  headingLevel?: 'h2' | 'h3';
}
